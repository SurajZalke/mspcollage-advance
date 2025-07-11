import React from 'react';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { GameResultsDocument, GameResultsPDFProps } from './GameResultsPDF'; // Reusing GameResultsDocument
import { Button } from '@/components/ui/button';
import { Share2, Download } from 'lucide-react';

interface SharedQuizResultsActionsProps extends GameResultsPDFProps {}

export const SharedQuizResultsActions: React.FC<SharedQuizResultsActionsProps> = (props) => {
  const quizTitle = props.quiz?.title || 'Shared Quiz Results';
  const totalQuestions = props.quiz?.questions?.length || 0; // <-- Fix: always calculate

  const handleShare = async (blob: Blob | null) => {
    if (!blob) {
      alert('PDF not ready for sharing.');
      return;
    }

    if (navigator.share) {
      try {
        const file = new File([blob], `${quizTitle}.pdf`, { type: 'application/pdf' });
        await navigator.share({
          title: quizTitle,
          text: `Check out the results for ${quizTitle}!`, 
          files: [file],
        });
        console.log('Successfully shared');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };

  return (
    <BlobProvider document={<GameResultsDocument {...props} totalQuestions={totalQuestions} />}>
      {({ blob, url, loading, error }) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => handleShare(blob)}
            disabled={loading || !blob}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <PDFDownloadLink
            document={<GameResultsDocument {...props} totalQuestions={totalQuestions} />} // <-- Fix: pass totalQuestions here too
            fileName={`${quizTitle}.pdf`}
          >
            {({ loading: downloadLoading }) => (
              <Button
                disabled={downloadLoading}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <Download className="h-4 w-4" />
                {downloadLoading ? 'Download' : 'Download'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </BlobProvider>
  );
};