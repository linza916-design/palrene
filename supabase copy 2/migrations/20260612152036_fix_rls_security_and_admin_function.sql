
-- ============================================================
-- Step 1: Create is_admin() SECURITY DEFINER function
-- Checks if current user has is_admin=true in profiles table.
-- SECURITY DEFINER so it bypasses RLS when checking admin status.
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- ============================================================
-- Step 2: CRITICAL - Remove user_tokens direct UPDATE
-- Users can currently set their own balance=999999.
-- All token mutations must go through add_user_tokens() and
-- spend_user_tokens() RPCs which are SECURITY DEFINER.
-- ============================================================
DROP POLICY IF EXISTS "update_own_tokens" ON user_tokens;

-- ============================================================
-- Step 3: Fix ads UPDATE - any user can update any ad
-- ============================================================
DROP POLICY IF EXISTS "update_ad_status" ON ads;

CREATE POLICY "update_own_ad" ON ads
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR is_admin());

CREATE POLICY "delete_own_ad" ON ads
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR is_admin());

-- ============================================================
-- Step 4: Fix groups - missing UPDATE and DELETE policies
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='update_own_group'
  ) THEN
    EXECUTE 'CREATE POLICY "update_own_group" ON groups FOR UPDATE TO authenticated USING (auth.uid() = created_by OR is_admin())';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='delete_own_group'
  ) THEN
    EXECUTE 'CREATE POLICY "delete_own_group" ON groups FOR DELETE TO authenticated USING (auth.uid() = created_by OR is_admin())';
  END IF;
END $$;

-- ============================================================
-- Step 5: Add DELETE policy for connections
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='delete_own_connection'
  ) THEN
    EXECUTE 'CREATE POLICY "delete_own_connection" ON connections FOR DELETE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = recipient_id)';
  END IF;
END $$;

-- ============================================================
-- Step 6: Admin SELECT for payments
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='admin_select_all_payments'
  ) THEN
    EXECUTE 'CREATE POLICY "admin_select_all_payments" ON payments FOR SELECT TO authenticated USING (is_admin())';
  END IF;
END $$;

-- ============================================================
-- Step 7: profiles missing DELETE policy (needed for account deletion)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='delete_own_profile'
  ) THEN
    EXECUTE 'CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id)';
  END IF;
END $$;
