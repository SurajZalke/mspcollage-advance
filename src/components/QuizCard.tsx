import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types";
import { Trash2, Play, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePDF } from 'react-to-pdf';
import QuizPdfContent from './QuizPdfContent';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
  onDelete?: (quizId: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, onDelete }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toPDF, targetRef } = usePDF({
    filename: `${quiz.title.replace(/\s/g, '_')}_Quiz.pdf`,
    page: { format: 'A4', orientation: 'portrait' },
    // This is important: we want to generate PDF from the hidden content
    // not the visible card content.
    overrides: {
      pdf: { compress: true },
      canvas: { useCORS: true },
    },
  });

  const handleEdit = (quizId: string) => {
    navigate("/create-quiz", { state: { quizId } });
  };

  const handleDownloadPdf = () => {
    // Trigger PDF generation from the hidden content
    toPDF();
  };

  const { toast } = useToast();

  const handleShare = async () => {
    const quizLink = `${window.location.origin}/play-quiz/${quiz.id}`;

      if (navigator.share) {
        await navigator.share({
          title: quiz.title,
          text: `Join my quiz: ${quiz.title}`,
          url: quizLink,
        });
        toast({
          title: "Quiz link shared!",
          description: "The quiz link has been shared successfully.",
        });
      } else {
        // Fallback for browsers that do not support Web Share API
        // For example, open WhatsApp Web with a pre-filled message
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Join my Quiz: ' + quiz.title + ' ' + quizLink)}`;
        window.open(whatsappUrl, '_blank');
        toast({
          title: "Opening WhatsApp...",
          description: "Your browser does not support direct sharing. Opening WhatsApp to share the link.",
        });
      }
  };

  return (
    <Card className="quiz-card transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-6 relative">
        <div className="mb-4">
          <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-purple-200 text-purple-800">
            Grade {quiz.grade} • {quiz.subject}
          </span>
        </div>
        <h3 className="text-lg font-bold text-quiz-dark mb-2">{quiz.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{quiz.questions.length} Questions</span>
          <span>Topic: {quiz.topic}</span>
        </div>
        <Button
          variant="outline"
          className="absolute top-2 right-2 flex items-center gap-2"
          onClick={() => handleEdit(quiz.id)}
        >
          Edit
        </Button>
      </CardContent>
      {/* Hidden content for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={targetRef}>
          <QuizPdfContent
            quiz={quiz}
            hostName={currentUser?.user_metadata?.name || 'Unknown Host'}
            hostAvatarUrl={currentUser?.user_metadata?.avatar_url || ''}
          />
        </div>
      </div>
      <CardFooter className="pt-0 px-6 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2">
          <div>
            {quiz.hasNegativeMarking && (
              <span className="text-xs text-red-500">
                Negative marking: {quiz.negativeMarkingValue}%
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Share Quiz
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
            {onDelete && (
              <Button
                variant="destructive"
                className="dark:bg-red-600 dark:hover:bg-red-700 flex items-center gap-2"
                onClick={() => onDelete(quiz.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button
              className="quiz-btn-primary flex items-center gap-2"
              onClick={() => onStart(quiz.id)}
            >
              <Play className="h-4 w-4" />
              Start Quiz
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
