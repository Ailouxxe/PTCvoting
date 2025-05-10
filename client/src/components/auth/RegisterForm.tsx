import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Schema with validation
const registerSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .refine(
      (email) => email.endsWith('@paterostechnologicalcollege.edu.ph'),
      {
        message: 'Please use your official college email (@paterostechnologicalcollege.edu.ph)',
      }
    ),
  studentId: z
    .string()
    .min(5, 'Student ID is required')
    .regex(/^\d{4}-\d{5}$/, 'Student ID should be in format: 20XX-XXXXX'),
  fullName: z
    .string()
    .min(3, 'Full name is required')
    .regex(/^[a-zA-Z\s]+$/, 'Name should contain only letters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/.*[0-9].*/, 'Password must contain at least 1 number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onToggleForm: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const { register } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      studentId: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register(values.email, values.password, values.fullName, values.studentId);
      toast({
        title: 'Registration successful',
        description: 'Your account has been created. You can now login.',
      });
      onToggleForm(); // Switch back to login form
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="student@paterostechnologicalcollege.edu.ph"
                    type="email"
                  />
                </FormControl>
                <p className="text-xs text-neutral-500 mt-1">
                  Must end with @paterostechnologicalcollege.edu.ph
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="20XX-XXXXX" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Juan Dela Cruz" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="••••••••" />
                </FormControl>
                <p className="text-xs text-neutral-500 mt-1">
                  Minimum 8 characters with at least 1 number
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="••••••••" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700">
            Register
          </Button>
        </form>
      </Form>

      <div className="text-center mt-4">
        <p className="text-sm text-neutral-600">
          Already have an account?{' '}
          <button
            type="button"
            className="text-primary-600 hover:text-primary-500 font-medium"
            onClick={onToggleForm}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
