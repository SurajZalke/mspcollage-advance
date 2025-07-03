import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { GameResultsDocument, GameResultsPDFProps } from './GameResultsPDF';
import { Button } from '@/components/ui/button';
import { Share2, Download } from 'lucide-react';

interface GameResultsActionsProps extends GameResultsPDFProps {}

export const GameResultsActions: React.FC<GameResultsActionsProps> = (props) => {
  const handleShare = () => {
    // Implement sharing logic here
    // For example, using Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Game Results PDF',
        text: 'Check out these game results!',
        url: window.location.href, // You might want to generate a temporary URL for the PDF
      }).then(() => {
        console.log('Successfully shared');
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that do not support Web Share API
      alert('Web Share API is not supported in your browser. You can download the PDF instead.');
    }
  };

  return (
    <div className="flex space-x-2">
      <PDFDownloadLink
        document={<GameResultsDocument {...props} />}
        fileName={`game-results-${new Date().toISOString().split('T')[0]}.pdf`}
      >
        {({ loading }) => (
          <Button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-[#232b4a] text-white hover:bg-[#323c64]"
            disabled={loading}
          >
            {loading ? 'Preparing PDF...' : <><Download className="h-4 w-4 mr-2" /> Download</>}
          </Button>
        )}
      </PDFDownloadLink>
      <Button
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4 mr-2" /> Share
      </Button>
    </div>
  );
};