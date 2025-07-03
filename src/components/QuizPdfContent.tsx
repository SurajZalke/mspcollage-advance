import React from 'react';
import { Quiz, Question } from '@/types';

interface QuizPdfContentProps {
  quiz: Quiz;
  hostName: string;
  hostAvatarUrl?: string;
}

// Group questions into chunks of 7
const chunkRemainingQuestions = (questions: Question[]): Question[][] => {
  const chunks: Question[][] = [];
  let i = 0;
  while (i < questions.length) {
    chunks.push(questions.slice(i, i + 7));
    i += 7;
  }
  return chunks;
};

const QuizPdfContent: React.FC<QuizPdfContentProps> = ({ quiz, hostName, hostAvatarUrl }) => {
  const allQuestions = quiz.questions;
  const pageOneQuestions = allQuestions.slice(0, 4);
  const remaining = allQuestions.slice(4);
  const remainingChunks = chunkRemainingQuestions(remaining);

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        width: '100%',
        boxSizing: 'border-box',
        color: '#000',
      }}
    >
      {/* Header */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img
            src="/msplogo.jpg"
            alt="MSP College Manora Logo"
            style={{ width: '50px', height: '50px', marginRight: '10px' }}
          />
          <h1 style={{ fontSize: '30px', color: '#232b4a', fontWeight: 'bold', margin: 0 }}>
            MSP College Manora
          </h1>
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <img
              src="/developer.png"
              alt="Creator Photo"
              style={{
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                marginRight: '6px',
              }}
            />
            <span style={{ fontSize: '9px', color: '#555' }}>
              Created by Mr Suraj Zalke ❣️
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={hostAvatarUrl || '/msplogo.jpg'}
              alt="Host Avatar"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                marginRight: '4px',
              }}
            />
            <span style={{ fontSize: '8px', color: '#777' }}>Host: {hostName}</span>
          </div>
        </div>
      </div>

      {/* Quiz Info */}
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#333', textAlign: 'center' }}>
        {quiz.title}
      </h1>
      <p style={{ marginBottom: '15px', color: '#666', textAlign: 'center' }}>{quiz.description}</p>

      <div
        style={{
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px',
        }}
      >
        <p>
          <strong>Subject:</strong> {quiz.subject}
        </p>
        <p>
          <strong>Grade:</strong> {quiz.grade}
        </p>
        <p>
          <strong>Topic:</strong> {quiz.topic}
        </p>
        <p>
          <strong>Total Questions:</strong> {quiz.questions.length}
        </p>
        {quiz.hasNegativeMarking && (
          <p>
            <strong>Negative Marking:</strong> {quiz.negativeMarkingValue}%
          </p>
        )}
      </div>

      {/* First Page – Q1 to Q4 */}
      <div style={{ pageBreakAfter: 'always' }}>
        {pageOneQuestions.map((question, index) => (
          <div
            key={question.id}
            style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}
          >
            <h2 style={{ fontSize: '16px', color: '#000' }}>
              {index + 1}. {question.text}
            </h2>
            {question.imageUrl && (
              <img
                src={question.imageUrl}
                alt="Question"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  breakInside: 'avoid',
                }}
              />
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {question.options.map((option) => (
                <li key={option.id} style={{ marginBottom: '4px', lineHeight: '1.2' }}>
                  {option.text}
                </li>
              ))}
            </ul>
            <p style={{ fontWeight: 'bold', color: '#28a745' }}>
              Correct Answer:{' '}
              {question.options.find((opt) => opt.id === question.correctOption)?.text || 'N/A'}
            </p>
          </div>
        ))}
      </div>

      {/* Remaining Pages – Q5+ (7 per page) */}
      {remainingChunks.map((chunk, chunkIndex) => {
        const isFullPage = chunk.length === 7;

        return (
          <div
            key={chunkIndex}
            style={{
              pageBreakAfter: 'always',
              breakInside: 'avoid',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isFullPage ? 'space-between' : 'flex-start',
              height: '1122px',
              paddingBottom: '20px',
              gap: isFullPage ? '10px' : '20px',
            }}
          >
            {chunk.map((question, qIndex) => {
              const globalIndex = 4 + chunkIndex * 7 + qIndex + 1;

              return (
                <div
                  key={question.id}
                  style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                    marginBottom: isFullPage ? 0 : '20px',
                  }}
                >
                  <h2 style={{ fontSize: '16px', color: '#000', marginBottom: '10px' }}>
                    {globalIndex}. {question.text}
                  </h2>
                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        marginBottom: '10px',
                        borderRadius: '4px',
                        breakInside: 'avoid',
                      }}
                    />
                  )}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        style={{
                          marginBottom: '4px',
                          lineHeight: '1.2',
                          breakInside: 'avoid',
                        }}
                      >
                        {option.text}
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontWeight: 'bold', color: '#28a745' }}>
                    Correct Answer:{' '}
                    {question.options.find((opt) => opt.id === question.correctOption)?.text || 'N/A'}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default QuizPdfContent;
