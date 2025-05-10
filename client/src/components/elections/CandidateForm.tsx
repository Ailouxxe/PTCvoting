import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useElection } from '@/context/ElectionContext';
import { Candidate, Election } from '@/types';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus } from 'lucide-react';

const candidateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  department: z.string().min(2, 'Department is required'),
  manifesto: z.string().min(10, 'Manifesto must be at least 10 characters'),
  electionId: z.string().min(1, 'Election is required'),
  photo: z.instanceof(FileList).optional(),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

interface CandidateFormProps {
  candidate?: Candidate;
  elections: Election[];
  preSelectedElectionId?: string;
  onSubmitSuccess: () => void;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ 
  candidate, 
  elections, 
  preSelectedElectionId,
  onSubmitSuccess 
}) => {
  const { addCandidate, updateCandidate } = useElection();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(candidate?.photoURL || null);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: candidate?.name || '',
      department: candidate?.department || '',
      manifesto: candidate?.manifesto || '',
      electionId: candidate?.electionId || preSelectedElectionId || '',
    },
  });

  // Update form when candidate data changes
  useEffect(() => {
    if (candidate) {
      form.reset({
        name: candidate.name,
        department: candidate.department,
        manifesto: candidate.manifesto,
        electionId: candidate.electionId,
      });
      if (candidate.photoURL) {
        setPhotoPreview(candidate.photoURL);
      }
    } else if (preSelectedElectionId) {
      form.setValue('electionId', preSelectedElectionId);
    }
  }, [candidate, preSelectedElectionId, form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const onSubmit = async (values: CandidateFormValues) => {
    setIsSubmitting(true);
    try {
      let photoURL = candidate?.photoURL || '';
      
      // Handle photo upload if a new photo was selected
      if (values.photo && values.photo.length > 0) {
        const file = values.photo[0];
        const fileRef = ref(storage, `candidates/${values.electionId}/${Date.now()}_${file.name}`);
        
        const uploadResult = await uploadBytes(fileRef, file);
        photoURL = await getDownloadURL(uploadResult.ref);
      }
      
      if (candidate) {
        // Update existing candidate
        await updateCandidate(candidate.id, {
          name: values.name,
          department: values.department,
          manifesto: values.manifesto,
          electionId: values.electionId,
          ...(photoURL ? { photoURL } : {}),
        });
        toast({
          title: 'Candidate updated',
          description: 'The candidate has been updated successfully.',
        });
      } else {
        // Create new candidate
        await addCandidate({
          name: values.name,
          department: values.department,
          manifesto: values.manifesto,
          electionId: values.electionId,
          photoURL: photoURL,
        });
        toast({
          title: 'Candidate added',
          description: 'The candidate has been added successfully.',
        });
      }
      onSubmitSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-24 h-24">
                <AvatarImage src={photoPreview || ''} />
                <AvatarFallback className="text-lg">
                  {form.getValues('name') ? getInitials(form.getValues('name')) : 'CN'}
                </AvatarFallback>
              </Avatar>
              
              <FormField
                control={form.control}
                name="photo"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="cursor-pointer">
                      <div className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
                        <ImagePlus size={18} />
                        <span>{candidate?.photoURL ? 'Change Photo' : 'Upload Photo'}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handlePhotoChange(e);
                          onChange(e.target.files);
                        }}
                        {...field}
                      />
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Juan Dela Cruz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Computer Science Department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manifesto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manifesto</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write the candidate's manifesto and goals..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="electionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Election</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!!preSelectedElectionId || !!candidate}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select election" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {elections.map((election) => (
                        <SelectItem key={election.id} value={election.id}>
                          {election.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onSubmitSuccess}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : candidate ? 'Update Candidate' : 'Add Candidate'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CandidateForm;
