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
      {/* Header Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/msplogo.jpg"
            alt="MSP College Manora Logo"
            style={{ width: '50px', height: '50px', marginRight: '10px' }}
          />
          <h1 style={{ fontSize: '30px', color: '#232b4a', fontWeight: 'bold', margin: 0 }}>
            MSP College Manora
          </h1>
        </div>

        {/* Quiz Title */}
        <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#333', textAlign: 'center' }}>
          {quiz.title}
        </h1>
        <p style={{ marginBottom: '15px', color: '#666', textAlign: 'center' }}>{quiz.description}</p>
      </div>

      {/* Quiz Info + Creator/Host Panel */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px',
        }}
      >
        <div>
          <p><strong>Subject:</strong> {quiz.subject}</p>
          <p><strong>Grade:</strong> {quiz.grade}</p>
          <p><strong>Topic:</strong> {quiz.topic}</p>
          <p><strong>Total Questions:</strong> {quiz.questions.length}</p>
          {quiz.hasNegativeMarking && (
            <p><strong>Negative Marking:</strong> {quiz.negativeMarkingValue}%</p>
          )}
        </div>

        {/* Creator & Host Panel */}
        <div style={{ textAlign: 'right' }}>
          {/* Creator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: '6px',
            }}
          >
            <img
              src="/developer.png"
              alt="Creator"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                marginRight: '6px',
                objectFit: 'cover',
              }}
            />
            <span style={{ fontSize: '9.5px', color: '#444', fontWeight: 500 }}>
              Created by Mr Suraj Zalke ❣️
            </span>
          </div>

          {/* Host */}
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <img
              src={hostAvatarUrl || "/msplogo.jpg"}
              alt="Host Avatar"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                marginRight: '6px',
                objectFit: 'cover',
              }}
            />
            <span style={{ fontSize: '9.5px', color: '#666' }}>
              Host: {hostName}
            </span>
          </div>
        </div>
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
              paddingBottom: '40px',
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
                    ...(globalIndex >= 13 &&
                      (globalIndex - 13) % 7 === 0 &&
                      quiz.questions.length > 25
                      ? { marginBottom: '80px' }
                      : {}),
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
