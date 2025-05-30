import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Loader2 } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from '@/lib/firebaseConfig';



const ProfileSetup: React.FC = () => {
  const { currentUser, updateProfile, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setAvatarUrl(URL.createObjectURL(file)); // Show preview of selected file
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/host-login');
      return;
    }

    if (currentUser?.user_metadata) {
      setNickname(currentUser.user_metadata.name || '');
      setAvatarUrl(currentUser.user_metadata.avatar_url || '');
      setBio(currentUser.user_metadata.bio || '');
    }
  }, [currentUser, isLoggedIn, navigate]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
    }
  };

  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);


    try {
      let finalAvatarUrl = currentUser?.user_metadata?.avatar_url || '';

      if (avatarFile && currentUser) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentUser.uid}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        


        const storage = getStorage();
        const avatarRef = ref(storage, filePath);

        try {
          const snapshot = await uploadBytes(avatarRef, avatarFile);
          finalAvatarUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadError: any) {
          throw new Error(`Failed to upload avatar: ${uploadError.message}`);
        }
      } else if (avatarUrl && avatarUrl !== currentUser?.user_metadata?.avatar_url) {
        finalAvatarUrl = avatarUrl;
      }

      await updateProfile({
        name: nickname,
        avatar_url: finalAvatarUrl,
        bio: bio
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been set up successfully!',
      });

      navigate('/host-dashboard');

    } catch (error: any) {

      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add a photo and details to help others recognize you
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">


            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{nickname?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="w-full space-y-4">
              <div>
                <Input
                  placeholder="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <Textarea
                  placeholder="Tell us a bit about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-24 resize-none"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !nickname.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSetup;
