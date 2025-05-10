import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  Timestamp,
  onSnapshot,
  orderBy,
  getDoc,
  serverTimestamp,
  DocumentReference
} from 'firebase/firestore';
import { ref, onValue, push, set } from "firebase/database";
import { firestore, database } from '@/lib/firebase';
import { Election, Candidate, Vote, VoterActivity } from '@/types';
import { useAuth } from './AuthContext';

interface ElectionContextType {
  elections: Election[];
  activeElections: Election[];
  upcomingElections: Election[];
  completedElections: Election[];
  candidates: Candidate[];
  votes: Vote[];
  voterActivity: VoterActivity[];
  isLoading: boolean;
  createElection: (election: Omit<Election, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateElection: (id: string, data: Partial<Election>) => Promise<void>;
  deleteElection: (id: string) => Promise<void>;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'createdAt'>) => Promise<string>;
  updateCandidate: (id: string, data: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  castVote: (electionId: string, candidateId: string) => Promise<void>;
  getElectionResults: (electionId: string) => Promise<Candidate[]>;
  hasVoted: (electionId: string) => boolean;
  getElectionById: (id: string) => Promise<Election | null>;
  getCandidatesByElection: (electionId: string) => Promise<Candidate[]>;
  getUserVotingHistory: () => Promise<Array<{vote: Vote, election: Election, candidate: Candidate}>>;
  refreshData: () => Promise<void>;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (context === undefined) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voterActivity, setVoterActivity] = useState<VoterActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const now = new Date();
  
  const activeElections = elections.filter(
    election => election.startDate <= now && election.endDate >= now
  );
  
  const upcomingElections = elections.filter(
    election => election.startDate > now
  );
  
  const completedElections = elections.filter(
    election => election.endDate < now
  );

  // Fetch all elections, candidates and votes
  useEffect(() => {
    if (!currentUser) {
      setElections([]);
      setCandidates([]);
      setVotes([]);
      setVoterActivity([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch elections
    const electionsQuery = query(
      collection(firestore, 'elections'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeElections = onSnapshot(electionsQuery, (snapshot) => {
      const electionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          department: data.department,
          status: data.status,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          type: data.type
        } as Election;
      });
      setElections(electionsData);
    });

    // Fetch candidates
    const candidatesQuery = query(
      collection(firestore, 'candidates'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeCandidates = onSnapshot(candidatesQuery, (snapshot) => {
      const candidatesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          department: data.department,
          manifesto: data.manifesto,
          photoURL: data.photoURL,
          electionId: data.electionId,
          createdAt: data.createdAt.toDate()
        } as Candidate;
      });
      setCandidates(candidatesData);
    });

    // Fetch votes
    const unsubscribeVotes = onSnapshot(
      query(collection(firestore, 'votes'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        const votesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            electionId: data.electionId,
            candidateId: data.candidateId,
            userId: data.userId,
            timestamp: data.timestamp.toDate()
          } as Vote;
        });
        setVotes(votesData);
      }
    );

    // Subscribe to voter activity feed from Realtime Database
    const voterActivityRef = ref(database, 'voterActivity');
    const unsubscribeVoterActivity = onValue(voterActivityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activityList: VoterActivity[] = Object.keys(data).map(key => ({
          id: key,
          userId: data[key].userId,
          userName: data[key].userName,
          userInitials: data[key].userInitials,
          electionId: data[key].electionId,
          electionTitle: data[key].electionTitle,
          timestamp: new Date(data[key].timestamp)
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);
        
        setVoterActivity(activityList);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeElections();
      unsubscribeCandidates();
      unsubscribeVotes();
      unsubscribeVoterActivity();
    };
  }, [currentUser]);

  // Create a new election
  const createElection = async (electionData: Omit<Election, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!currentUser) throw new Error('You must be logged in');
    
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(firestore, 'elections'), {
        ...electionData,
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
        startDate: Timestamp.fromDate(electionData.startDate),
        endDate: Timestamp.fromDate(electionData.endDate)
      });
      
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to create election: ${error.message}`);
    }
  };

  // Update an existing election
  const updateElection = async (id: string, data: Partial<Election>) => {
    if (!currentUser) throw new Error('You must be logged in');
    
    try {
      const electionRef = doc(firestore, 'elections', id);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      // Convert Date objects to Firestore Timestamps
      if (data.startDate) updateData.startDate = Timestamp.fromDate(data.startDate);
      if (data.endDate) updateData.endDate = Timestamp.fromDate(data.endDate);
      
      await updateDoc(electionRef, updateData);
    } catch (error: any) {
      throw new Error(`Failed to update election: ${error.message}`);
    }
  };

  // Delete an election
  const deleteElection = async (id: string) => {
    if (!currentUser) throw new Error('You must be logged in');
    
    try {
      // First, delete all candidates for this election
      const candidatesSnapshot = await getDocs(
        query(collection(firestore, 'candidates'), where('electionId', '==', id))
      );
      
      const deletePromises = candidatesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Now delete the election
      await deleteDoc(doc(firestore, 'elections', id));
    } catch (error: any) {
      throw new Error(`Failed to delete election: ${error.message}`);
    }
  };

  // Add a new candidate
  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('You must be logged in');
    
    try {
      const docRef = await addDoc(collection(firestore, 'candidates'), {
        ...candidateData,
        createdAt: Timestamp.now()
      });
      
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add candidate: ${error.message}`);
    }
  };

  // Update an existing candidate
  const updateCandidate = async (id: string, data: Partial<Candidate>) => {
    if (!currentUser) throw new Error('You must be logged in');
    
    try {
      const candidateRef = doc(firestore, 'candidates', id);
      await updateDoc(candidateRef, data);
    } catch (error: any) {
      throw new Error(`Failed to update candidate: ${error.message}`);
    }
  };

  // Delete a candidate
  const deleteCandidate = async (id: string) => {
    if (!currentUser) throw new Error('You must be logged in');
    
    try {
      await deleteDoc(doc(firestore, 'candidates', id));
    } catch (error: any) {
      throw new Error(`Failed to delete candidate: ${error.message}`);
    }
  };

  // Cast a vote for a candidate in an election
  const castVote = async (electionId: string, candidateId: string) => {
    if (!currentUser) throw new Error('You must be logged in');
    
    // Check if user has already voted in this election
    if (hasVoted(electionId)) {
      throw new Error('You have already voted in this election');
    }
    
    try {
      // Get election and candidate details
      const electionDoc = await getDoc(doc(firestore, 'elections', electionId));
      const candidateDoc = await getDoc(doc(firestore, 'candidates', candidateId));
      
      if (!electionDoc.exists()) {
        throw new Error('Election not found');
      }
      
      if (!candidateDoc.exists()) {
        throw new Error('Candidate not found');
      }
      
      const electionData = electionDoc.data();
      const candidateData = candidateDoc.data();
      
      // Add the vote to Firestore
      await addDoc(collection(firestore, 'votes'), {
        electionId,
        candidateId,
        userId: currentUser.uid,
        timestamp: Timestamp.now()
      });
      
      // Create voter activity for real-time feed
      const userInitials = (currentUser.displayName || currentUser.email || "")
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      const voterActivityRef = push(ref(database, 'voterActivity'));
      await set(voterActivityRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
        userInitials,
        electionId,
        electionTitle: electionData.title,
        timestamp: serverTimestamp()
      });
      
    } catch (error: any) {
      throw new Error(`Failed to cast vote: ${error.message}`);
    }
  };

  // Get results for a specific election
  const getElectionResults = async (electionId: string): Promise<Candidate[]> => {
    try {
      // Get all candidates for this election
      const candidatesSnapshot = await getDocs(
        query(collection(firestore, 'candidates'), where('electionId', '==', electionId))
      );
      
      const candidates = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        voteCount: 0
      } as Candidate));
      
      // Get all votes for this election
      const votesSnapshot = await getDocs(
        query(collection(firestore, 'votes'), where('electionId', '==', electionId))
      );
      
      // Count votes for each candidate
      const voteCount: Record<string, number> = {};
      votesSnapshot.docs.forEach(doc => {
        const candidateId = doc.data().candidateId;
        voteCount[candidateId] = (voteCount[candidateId] || 0) + 1;
      });
      
      // Add vote counts to candidates
      const candidatesWithVotes = candidates.map(candidate => ({
        ...candidate,
        voteCount: voteCount[candidate.id] || 0
      }));
      
      // Sort by vote count (descending)
      return candidatesWithVotes.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    } catch (error: any) {
      throw new Error(`Failed to get election results: ${error.message}`);
    }
  };

  // Check if the current user has voted in a specific election
  const hasVoted = (electionId: string): boolean => {
    return votes.some(vote => vote.electionId === electionId);
  };

  // Get a specific election by ID
  const getElectionById = async (id: string): Promise<Election | null> => {
    try {
      const electionDoc = await getDoc(doc(firestore, 'elections', id));
      
      if (!electionDoc.exists()) {
        return null;
      }
      
      const data = electionDoc.data();
      return {
        id: electionDoc.id,
        title: data.title,
        description: data.description,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        department: data.department,
        status: data.status,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        type: data.type
      } as Election;
    } catch (error) {
      console.error("Error getting election by ID:", error);
      return null;
    }
  };

  // Get all candidates for a specific election
  const getCandidatesByElection = async (electionId: string): Promise<Candidate[]> => {
    try {
      const candidatesSnapshot = await getDocs(
        query(collection(firestore, 'candidates'), where('electionId', '==', electionId))
      );
      
      return candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      } as Candidate));
    } catch (error) {
      console.error("Error getting candidates by election:", error);
      return [];
    }
  };

  // Get user's voting history
  const getUserVotingHistory = async () => {
    if (!currentUser) return [];
    
    try {
      const userVotes = await getDocs(
        query(collection(firestore, 'votes'), where('userId', '==', currentUser.uid))
      );
      
      const history = await Promise.all(userVotes.docs.map(async voteDoc => {
        const voteData = voteDoc.data();
        const electionId = voteData.electionId;
        const candidateId = voteData.candidateId;
        
        // Get election details
        const electionDoc = await getDoc(doc(firestore, 'elections', electionId));
        // Get candidate details
        const candidateDoc = await getDoc(doc(firestore, 'candidates', candidateId));
        
        if (!electionDoc.exists() || !candidateDoc.exists()) {
          return null;
        }
        
        const electionData = electionDoc.data();
        const candidateData = candidateDoc.data();
        
        return {
          vote: {
            id: voteDoc.id,
            electionId,
            candidateId,
            userId: voteData.userId,
            timestamp: voteData.timestamp.toDate()
          } as Vote,
          election: {
            id: electionDoc.id,
            title: electionData.title,
            description: electionData.description,
            startDate: electionData.startDate.toDate(),
            endDate: electionData.endDate.toDate(),
            department: electionData.department,
            status: electionData.status,
            createdBy: electionData.createdBy,
            createdAt: electionData.createdAt.toDate(),
            updatedAt: electionData.updatedAt.toDate(),
            type: electionData.type
          } as Election,
          candidate: {
            id: candidateDoc.id,
            name: candidateData.name,
            department: candidateData.department,
            manifesto: candidateData.manifesto,
            photoURL: candidateData.photoURL,
            electionId: candidateData.electionId,
            createdAt: candidateData.createdAt.toDate()
          } as Candidate
        };
      }));
      
      return history.filter(item => item !== null) as Array<{vote: Vote, election: Election, candidate: Candidate}>;
    } catch (error) {
      console.error("Error getting voting history:", error);
      return [];
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Fetch elections
      const electionsSnapshot = await getDocs(
        query(collection(firestore, 'elections'), orderBy('createdAt', 'desc'))
      );
      
      const electionsData = electionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          department: data.department,
          status: data.status,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          type: data.type
        } as Election;
      });
      
      setElections(electionsData);
      
      // Fetch candidates
      const candidatesSnapshot = await getDocs(
        query(collection(firestore, 'candidates'), orderBy('createdAt', 'desc'))
      );
      
      const candidatesData = candidatesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          department: data.department,
          manifesto: data.manifesto,
          photoURL: data.photoURL,
          electionId: data.electionId,
          createdAt: data.createdAt.toDate()
        } as Candidate;
      });
      
      setCandidates(candidatesData);
      
      // Fetch user votes
      if (currentUser) {
        const votesSnapshot = await getDocs(
          query(collection(firestore, 'votes'), where('userId', '==', currentUser.uid))
        );
        
        const votesData = votesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            electionId: data.electionId,
            candidateId: data.candidateId,
            userId: data.userId,
            timestamp: data.timestamp.toDate()
          } as Vote;
        });
        
        setVotes(votesData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    elections,
    activeElections,
    upcomingElections,
    completedElections,
    candidates,
    votes,
    voterActivity,
    isLoading,
    createElection,
    updateElection,
    deleteElection,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    castVote,
    getElectionResults,
    hasVoted,
    getElectionById,
    getCandidatesByElection,
    getUserVotingHistory,
    refreshData
  };

  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>;
};
