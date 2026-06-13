import { supabase } from "./supabase";

interface TypingUser {
  user_id: string;
  username: string;
  avatar_url: string;
  timestamp: number;
}

const TYPING_TIMEOUT = 3000;
const TYPING_CHANNEL_PREFIX = "typing:";

const typingChannels = new Map<string, ReturnType<typeof supabase.channel>>();

export function subscribeToTyping(
  postId: string,
  currentUserId: string,
  onTypingUpdate: (users: TypingUser[]) => void,
) {
  const channelName = `${TYPING_CHANNEL_PREFIX}${postId}`;

  const channel = supabase
    .channel(channelName, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, TypingUser[]>;
      const users: TypingUser[] = [];

      Object.entries(state).forEach(([userId, presences]) => {
        if (userId !== currentUserId) {
          const presence = presences[0] as TypingUser | undefined;
          if (presence && Date.now() - presence.timestamp < TYPING_TIMEOUT) {
            users.push(presence);
          }
        }
      });

      onTypingUpdate(users);
    })
    .subscribe();

  typingChannels.set(postId, channel);

  return () => {
    channel.unsubscribe();
    typingChannels.delete(postId);
  };
}

export async function setTyping(
  postId: string,
  user: { id: string; username: string; avatar_url: string },
) {
  const channel = typingChannels.get(postId);
  if (!channel) return;

  await channel.track({
    user_id: user.id,
    username: user.username,
    avatar_url: user.avatar_url,
    timestamp: Date.now(),
  });
}

export async function clearTyping(postId: string) {
  const channel = typingChannels.get(postId);
  if (!channel) return;

  await channel.untrack();
}
