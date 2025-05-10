// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  studentId?: string;
  photoURL?: string;
  role: 'student' | 'admin';
  createdAt: Date | null;
}

// Election types
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  department: string;
  status: 'scheduled' | 'active' | 'completed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'campus-wide' | 'department';
}

// Candidate types
export interface Candidate {
  id: string;
  name: string;
  department: string;
  manifesto: string;
  photoURL?: string;
  electionId: string;
  createdAt: Date;
  voteCount?: number; // Only used for results display, not stored directly
}

// Vote types
export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  userId: string;
  timestamp: Date;
}

// VoterActivity for the live feed
export interface VoterActivity {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  electionId: string;
  electionTitle: string;
  timestamp: Date;
}
