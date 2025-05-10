import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, studentId: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            // If user exists in Firestore, use that data
            const userData = userDoc.data() as Omit<User, 'uid'>;
            
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: userData.displayName || firebaseUser.displayName || "",
              studentId: userData.studentId || "",
              photoURL: userData.photoURL || firebaseUser.photoURL || "",
              role: userData.role || "student",
              createdAt: userData.createdAt ? new Date((userData.createdAt as Timestamp).toDate()) : null
            });
          } else {
            // If user doesn't exist in Firestore (shouldn't happen), fallback to auth data
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: "student",
              createdAt: null
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register function (student only)
  const register = async (email: string, password: string, displayName: string, studentId: string) => {
    // Validate email domain
    if (!email.endsWith("@paterostechnologicalcollege.edu.ph")) {
      throw new Error("Please use your official college email address");
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile display name
      await updateProfile(firebaseUser, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(firestore, "users", firebaseUser.uid), {
        email,
        displayName,
        studentId,
        role: "student",
        createdAt: Timestamp.now(),
      });
      
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
