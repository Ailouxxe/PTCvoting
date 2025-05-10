import React from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="student@paterostechnologicalcollege.edu.ph"
                    type="email"
                  />
                </FormControl>
                <p className="text-xs text-neutral-500 mt-1">Use your official college email</p>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    id="rememberMe" 
                  />
                  <label 
                    htmlFor="rememberMe" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-700"
                  >
                    Remember me
                  </label>
                </div>
              )}
            />
            <a href="#" className="text-sm text-primary-600 hover:text-primary-500">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700">
            Sign in
          </Button>
        </form>
      </Form>

      <div className="text-center mt-4">
        <p className="text-sm text-neutral-600">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-primary-600 hover:text-primary-500 font-medium"
            onClick={onToggleForm}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
