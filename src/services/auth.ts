export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthUser | null>;
  uploadOnboardingData(data: Record<string, unknown>): Promise<void>;
  uploadWorkoutHistory(history: Record<string, unknown>[]): Promise<void>;
  uploadProgressRecords(records: Record<string, unknown>[]): Promise<void>;
}

export const authStub: AuthService = {
  async signIn() {
    throw new Error('Auth not implemented. Connect Supabase to enable sign in.');
  },
  async signUp() {
    throw new Error('Auth not implemented. Connect Supabase to enable sign up.');
  },
  async signOut() {},
  async getSession() {
    return null;
  },
  async uploadOnboardingData() {
    throw new Error('Auth not implemented. Connect Supabase to enable data sync.');
  },
  async uploadWorkoutHistory() {
    throw new Error('Auth not implemented. Connect Supabase to enable data sync.');
  },
  async uploadProgressRecords() {
    throw new Error('Auth not implemented. Connect Supabase to enable data sync.');
  },
};