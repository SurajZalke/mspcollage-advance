
import React, { useState, useEffect } from "react";
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Users, RefreshCw, Clock, Copy, CheckCircle, Share, QrCode } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import CreatorAttribution from "./CreatorAttribution";
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WaitingRoomProps {
  players: Player[];
  onStartGame: () => void;
  onRefreshPlayers?: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  resetTilt: () => void;
  gameCode?: string;
  isHost: boolean;
  nickname?: string;
  avatarUrl?: string;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  players,
  onStartGame,
  onRefreshPlayers,
  cardRef,
  handleMouseMove,
  resetTilt,
  gameCode,
  isHost,
  nickname,
  avatarUrl
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activePlayerCount, setActivePlayerCount] = useState(players.length);
  const [showQR, setShowQR] = useState(false);

  // Animation for player count changes
  useEffect(() => {
    if (players.length > activePlayerCount) {
      // New player joined, trigger confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast({
        title: "New player joined!",
        description: `${players[players.length - 1]?.nickname || 'Someone'} has entered the game`,
      });
    }
    setActivePlayerCount(players.length);
  }, [players.length, activePlayerCount, toast]);

  const copyCodeToClipboard = async () => {
    if (!gameCode) return;
    
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API not available or not in a secure context.");
      }
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      
      toast({
        title: "Game code copied!",
        description: "The code has been copied to your clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy game code:", err);
      toast({
        title: "Error",
        description: `Failed to copy game code: ${(err as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const handleRefreshClick = () => {
    if (!onRefreshPlayers) return;
    
    setRefreshing(true);
    onRefreshPlayers();
    
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // Generate QR code URL using a free service
  const qrCodeUrl = gameCode ? 
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/join?code=${gameCode}` : '';

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="quiz-card p-6 transform hover:scale-[1.02] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-quiz-dark dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Waiting Room

        </h2>
        
        {isHost ? (
          <Button 
            className="quiz-btn-primary"
            onClick={onStartGame}
            disabled={players.length === 0}
          >
            <Clock className="h-4 w-4 mr-2" />
            Start Quiz
          </Button>
        ) : (
          <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 px-3 py-2 rounded-md">
            Game Code: {gameCode}
          </div>
        )}
      </div>
      
      {/* Prominent game code display with animation for host */}
      {isHost && gameCode && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg border-none overflow-hidden">
          <div className="text-center relative">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
            </div>
            <h3 className="text-lg font-medium mb-2 relative z-10">Share this code with players</h3>
            <div className="flex items-center justify-center gap-3 relative z-10">
              <div className="text-3xl font-bold tracking-wider bg-white/20 px-6 py-2 rounded-md">
                {gameCode.split('').map((char, idx) => (
                  <span 
                    key={idx} 
                    className="inline-block"
                    style={{ 
                      animationDelay: `${idx * 0.15}s`,
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/30 hover:bg-white/40 transition-colors"
                onClick={copyCodeToClipboard}
              >
                {copied ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex justify-center gap-2 mt-3 relative z-10">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 transition-colors"
                onClick={copyCodeToClipboard}
              >
                <Share className="h-4 w-4 mr-1" />
                Share Code
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 transition-colors"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="h-4 w-4 mr-1" />
                Show QR
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="bg-white dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Players Joined: <span className="text-indigo-600 dark:text-indigo-400">{players.length}</span>
          </h3>
          
          {onRefreshPlayers && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefreshClick}
              className={`h-8 w-8 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {players.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Waiting for players to join...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, idx) => (
                  <TableRow 
                    key={idx}
                    className="transform hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 hover:scale-[1.02] transition-all duration-300"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={player.avatar || ''} />
                      <AvatarFallback>{player.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {player.nickname}
                  </TableCell>
                    <TableCell>
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Ready
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isHost && gameCode && (
          <Card className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border-none overflow-hidden">
            <div className="text-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-gray-500 dark:text-gray-400">Share this code with players:</span>
              </div>
              <div 
                className="flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-800/30 p-2 rounded-lg transition-colors" 
                onClick={copyCodeToClipboard}
              >
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">{gameCode}</span>
                {copied ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors" />
                )}
              </div>
              <div className="flex justify-center mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setShowQR(true)}
                >
                  <QrCode className="h-3 w-3 mr-1" />
                  Show QR Code
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Scan to Join the Game</DialogTitle>
          </DialogHeader>
          <div className="p-6 flex flex-col items-center gap-4">
            <div className="bg-white p-2 rounded-lg shadow-inner">
              <img 
                src={qrCodeUrl} 
                alt="QR Code to join game" 
                className="w-64 h-64 mx-auto animate-fade-in" 
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Scan this QR code with your phone camera to join the game
            </p>
            <p className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {gameCode}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      <CreatorAttribution />
    </div>
  );
};

export default WaitingRoom;
