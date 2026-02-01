import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=DotGothic16&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const staffList = [
  { columns: [
      { role: 'soui株式会社', names: ['井上 靖'] },
      { role: '株式会社ユニバース', names: ['子安 伸幸'] },
    ]
  },
  { role: 'コーポレート', names: ['静野 雅也', '西平 あゆみ', '髙倉 純子'] },
  { role: 'カスタマーサポート', names: ['髙田 直子', '髙島 明瑠', '岡本 優', '小林 梓', '小森 健太', '西岡 優花', '山岸 いづみ', '古藤 友美', '廣田 未来'] },
  { role: 'プロダクト', names: ['潟田 良太', '河野 祐輝', '永山 智栄美'] },
  { columns: [
      { role: 'ビジネス\nインテリジェンス', names: ['浦谷 孝輔'] },
      { role: 'コミュニケーション', names: ['佐藤 千尋'] },
      { role: 'インサイド\nセールス', names: ['北原 裕太', '新谷 英莉'] },
    ]
  },
  { role: 'セールス東日本', names: ['杉田 清隆', '山本 啓司'] },
  { role: 'セールス中日本', names: ['小坂井 優', '佐藤 千尋', '濱口 将太'] },
  { role: 'セールス西日本', names: ['林 崇', '北原 裕太', '小出 純', '山本 敏'] },
  { role: '代表取締役', names: ['加賀爪 宏介'] },
  { role: 'Produced by', names: ['山本 敏', '北原 裕太'], extraTime: 3000 },
];

// マップ画像（スタッフグループごとに1枚ずつ、最後は城下町）
const mapImages = [
  '/map1.png',   // soui/ユニバース
  '/map3.png',   // コーポレート
  '/map5.png',   // カスタマーサポート
  '/map7.png',   // プロダクト
  '/map4.png',   // BI/コミュニケーション/IS
  '/map8.png',   // セールス東日本
  '/map9.png',   // セールス中日本
  '/map6.png',   // セールス西日本
  '/map10.png',  // 代表取締役（城下町）
];

const Ending = () => {
  const bgmRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState('message'); // message -> credits -> levelup -> end
  const [currentGroup, setCurrentGroup] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [lvText, setLvText] = useState('');
  const [lvCharIndex, setLvCharIndex] = useState(0);
  const levelupSERef = useRef(null);

  const handleStart = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
    if (!bgmRef.current) {
      const audio = new Audio('/ending-bgm.m4a');
      audio.loop = false;
      audio.volume = 1.0;
      bgmRef.current = audio;
    }
    bgmRef.current.play().catch(() => {});
    setStarted(true);
    setTimeout(() => setFadeIn(true), 100);
  };

  useEffect(() => {
    if (!started) return;
    if (phase === 'message') {
      const t = setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setPhase('credits');
          setCurrentGroup(0);
          setTimeout(() => setFadeIn(true), 100);
        }, 1000);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [started, phase]);

  useEffect(() => {
    if (phase !== 'credits') return;

    const currentStaff = staffList[currentGroup];
    const nameCount = currentStaff.columns
      ? currentStaff.columns.reduce((sum, col) => sum + col.names.length, 0)
      : currentStaff.names.length;
    const displayTime = Math.max(2500, 1500 + nameCount * 400) + (currentStaff.extraTime || 0);

    const t = setTimeout(() => {
      setFadeIn(false);
      setTimeout(() => {
        if (currentGroup < staffList.length - 1) {
          setCurrentGroup(prev => prev + 1);
          setTimeout(() => setFadeIn(true), 100);
        } else {
          setPhase('levelup');
          setLvText('');
          setLvCharIndex(0);
          setTimeout(() => setFadeIn(true), 100);
        }
      }, 800);
    }, displayTime);
    return () => clearTimeout(t);
  }, [phase, currentGroup]);

  // レベルアップ演出
  const levelupMessage = 'やまもとさとし は\nレベルが　あがった！';

  useEffect(() => {
    if (phase !== 'levelup') return;

    // BGMを止めてレベルアップSEを再生
    if (bgmRef.current) {
      bgmRef.current.pause();
    }
    if (!levelupSERef.current) {
      const se = new Audio('/levelup.m4a');
      se.volume = 1.0;
      levelupSERef.current = se;
    }
    levelupSERef.current.currentTime = 0;
    levelupSERef.current.play().catch(() => {});
  }, [phase]);

  // レベルアップ文字送り
  useEffect(() => {
    if (phase !== 'levelup') return;

    if (lvCharIndex < levelupMessage.length) {
      const t = setTimeout(() => {
        setLvText(prev => prev + levelupMessage[lvCharIndex]);
        setLvCharIndex(prev => prev + 1);
      }, 80);
      return () => clearTimeout(t);
    } else {
      // 表示完了後、5秒待って最終画面へ
      const t = setTimeout(() => {
        setFadeIn(false);
        setTimeout(() => {
          setPhase('end');
          setTimeout(() => setFadeIn(true), 100);
        }, 1000);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [phase, lvCharIndex]);

  // スタート前
  if (!started) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"DotGothic16", monospace',
        cursor: 'pointer'
      }}
        onClick={handleStart}
      >
        <p style={{
          color: '#888',
          fontSize: 'clamp(18px, 3vw, 32px)',
          animation: 'blink 1.2s infinite'
        }}>
          ▶ PRESS START
        </p>
        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  const currentMapImage = mapImages[currentGroup] || mapImages[mapImages.length - 1];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      fontFamily: '"DotGothic16", monospace',
      overflow: 'hidden'
    }}>

      {/* 左半分：マップ画像 */}
      {phase === 'credits' && (
        <div style={{
          width: '30vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <img
            src={currentMapImage}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              imageRendering: 'pixelated',
              opacity: fadeIn ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out'
            }}
          />
        </div>
      )}

      {/* 右半分（またはフル画面）：テキスト */}
      <div style={{
        width: phase === 'credits' ? '70vw' : '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'width 1s ease'
      }}>

        {/* オープニングメッセージ */}
        {phase === 'message' && (
          <div style={{
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 1.5s ease-in',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#fff',
              fontSize: 'clamp(36px, 6vw, 72px)',
              letterSpacing: '0.3em',
              lineHeight: 2
            }}>
              そして　でんせつが　はじまった！
            </p>
          </div>
        )}

        {/* スタッフクレジット */}
        {phase === 'credits' && (
          <div style={{
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            textAlign: 'center',
            display: 'flex',
            flexDirection: staffList[currentGroup].columns ? 'row' : 'column',
            alignItems: staffList[currentGroup].columns ? 'flex-start' : 'center',
            justifyContent: 'center',
            gap: staffList[currentGroup].columns ? '40px' : '20px',
            padding: '0 24px'
          }}>
            {staffList[currentGroup].columns ? (
              staffList[currentGroup].columns.map((col, ci) => (
                <div key={ci} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <p style={{
                    color: '#fff',
                    fontSize: 'clamp(24px, 3.75vw, 48px)',
                    letterSpacing: '0.15em',
                    marginBottom: '8px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.4
                  }}>
                    {col.role}
                  </p>
                  {col.names.map((name, i) => (
                    <p key={i} style={{
                      color: '#fff',
                      fontSize: 'clamp(27px, 4.5vw, 54px)',
                      letterSpacing: '0.1em'
                    }}>
                      {name}
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <>
                <p style={{
                  color: '#fff',
                  fontSize: 'clamp(24px, 3.75vw, 48px)',
                  letterSpacing: '0.2em',
                  marginBottom: '12px'
                }}>
                  {staffList[currentGroup].role}
                </p>
                {staffList[currentGroup].names.map((name, i) => (
                  <p key={i} style={{
                    color: '#fff',
                    fontSize: 'clamp(27px, 4.5vw, 54px)',
                    letterSpacing: '0.15em'
                  }}>
                    {name}
                  </p>
                ))}
              </>
            )}
          </div>
        )}

      </div>

      {/* レベルアップ画面 */}
      {phase === 'levelup' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: '10vh',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.8s ease-in'
        }}>
          {/* DQ風メッセージウィンドウ */}
          <div style={{
            border: '6px solid #fff',
            padding: '8px',
            backgroundColor: '#000',
            width: '80%',
            maxWidth: '900px'
          }}>
            <div style={{
              border: '3px solid #888',
              padding: 'clamp(24px, 4vw, 48px)',
              minHeight: 'clamp(100px, 15vw, 180px)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <p style={{
                color: '#fff',
                fontSize: 'clamp(24px, 4vw, 48px)',
                lineHeight: 2,
                margin: 0,
                whiteSpace: 'pre-wrap',
                letterSpacing: '0.15em'
              }}>
                {lvText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 終了画面：全画面画像 */}
      {phase === 'end' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 2s ease-in',
          backgroundColor: '#000'
        }}>
          <img
            src="/ending-final.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Ending;
