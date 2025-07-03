import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { Player, Quiz } from '@/types';

export interface GameResultsPDFProps {
  players: Player[];
  quiz?: Quiz;
  totalQuestions: number;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#232b4a',
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
  },
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 35,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#232b4a',
    color: '#ffffff',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    textAlign: 'center',
  },
  rankCell: {
    width: '15%',
    textAlign: 'center',
    padding: 8,
  },
  playerCell: {
    width: '40%',
    textAlign: 'left',
    padding: 8,
  },
  scoreCell: {
    width: '20%',
    textAlign: 'center',
    padding: 8,
  },
  accuracyCell: {
    width: '20%',
    textAlign: 'center',
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statsLabel: {
    color: '#666',
    fontSize: 12,
  },
  statsValue: {
    color: '#232b4a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  creatorAttribution: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: '#232b4a',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  creatorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  creatorName: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'Helvetica',
  },
  collegeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  collegeLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  collegeName: {
    fontSize: 30,
    color: '#232b4a',
    fontWeight: 'bold',
    width: 'auto',
  },
  footerText: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

// PDF Document component
export const GameResultsDocument: React.FC<GameResultsPDFProps> = ({ players, quiz, totalQuestions }) => {
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.collegeHeader}>
          <Image src="/msplogo.jpg" style={styles.collegeLogo} />
          <Text style={styles.collegeName}>MSP College Manora</Text>
        </View>

        <Text style={styles.header}>Game Results</Text>
        {quiz && (
          <Text style={styles.subHeader}>
            Quiz: {quiz.title}
          </Text>
        )}

        {/* Average Accuracy Display */}
        {totalQuestions > 0 && (
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Average Accuracy:</Text>
            <Text style={styles.statsValue}>
              {(sortedPlayers.reduce((acc, player) => 
                acc + ((player.answers?.filter(ans => ans.correct).length || 0) / totalQuestions), 0) 
                / sortedPlayers.length * 100).toFixed(1)}%
            </Text>
          </View>
        )}

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.rankCell}>Rank</Text>
            <Text style={styles.playerCell}>Player</Text>
            <Text style={styles.scoreCell}>Score</Text>
            <Text style={styles.accuracyCell}>Correct</Text>
            <Text style={styles.accuracyCell}>Accuracy</Text>
          </View>

          {/* Table Body */}
          {sortedPlayers.map((player, index) => {
            const correctAnswers = player.answers?.filter(ans => ans.correct).length || 0;
            const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

            return (
              <View key={player.player_id} style={styles.tableRow}>
                <Text style={styles.rankCell}>{index + 1}</Text>
                <Text style={styles.playerCell}>{player.nickname}</Text>
                <Text style={styles.scoreCell}>{player.score}</Text>
                <Text style={styles.accuracyCell}>{correctAnswers}/{totalQuestions}</Text>
                <Text style={styles.accuracyCell}>{accuracy.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.creatorAttribution}>
          <Image src="/developer.png" style={styles.creatorImage} />
          <Text style={styles.creatorName}>Created by Mr. Suraj Zalke</Text>
        </View>

        <Text style={styles.footerText}>
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </Text>
      </Page>
    </Document>
  );
};

// Download button component
export const GameResultsDownloadButton: React.FC<GameResultsPDFProps> = (props) => {
  return (
    <PDFDownloadLink
      document={<GameResultsDocument {...props} />}
      fileName={`game-results-${new Date().toISOString().split('T')[0]}.pdf`}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-[#232b4a] text-white hover:bg-[#323c64]"
    >
      {({ loading }) =>
        loading ? 'Preparing PDF...' : 'Download Results PDF'
      }
    </PDFDownloadLink>
  );
};