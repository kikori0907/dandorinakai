import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';

// ドット風フォントを読み込み
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=DotGothic16&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const DandoriOpening = () => {
  // BGM
  const bgmRef = useRef(null);

  // タイトル画面の状態
  const [titlePhase, setTitlePhase] = useState('black'); // 'black' -> 'fadeIn' -> 'visible' -> 'done'

  const [currentScene, setCurrentScene] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [showCommand, setShowCommand] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [commandConfirmed, setCommandConfirmed] = useState(false);

  const commands = [
    { name: 'たたかう', action: 'fight' },
    { name: 'にげる', action: 'run' }
  ];

  const scenes = [
    {
      text: "旅人よ、耳を傾けよ。",
      duration: 6000,
      delay: 500
    },
    {
      text: "13期 第3四半期——\n我らダンドリワークの戦士たちが\n滋賀の地とオンラインに終結する。\n戦力は整った。",
      duration: 9000,
      delay: 500
    },
    {
      text: "建設業界に吹き荒れる逆風。\nされど我らの力で\n業界に追い風を立てる。",
      duration: 8000,
      delay: 500
    },
    {
      text: "王より伝令——\n「悠長な気持ちは今日で捨てよ。\n　この危機感を胸に\n　2026年を駆け抜ける！」",
      duration: 9000,
      delay: 500
    },
    {
      text: "「なんかやれそうじゃん」\nこのワクワクを胸に——\n今こそ力を合わせ、強敵を討ち倒さん！",
      duration: 10000,
      delay: 500
    },
    {
      text: "『ダンドリな会』開幕——",
      duration: 5000,
      delay: 500,
      isTitle: true
    }
  ];

  const totalScenes = scenes.length;

  // DQ3風タイトル画面の演出タイマー
  useEffect(() => {
    if (titlePhase === 'black') {
      // 1.5秒の暗転後、フェードイン開始
      const t = setTimeout(() => setTitlePhase('fadeIn'), 1500);
      return () => clearTimeout(t);
    }
    if (titlePhase === 'fadeIn') {
      // 2秒かけてフェードインし、visible状態へ
      const t = setTimeout(() => setTitlePhase('visible'), 2000);
      return () => clearTimeout(t);
    }
  }, [titlePhase]);

  // タイトル画面クリックで次へ
  const dismissTitle = useCallback(() => {
    if (titlePhase === 'visible') {
      setTitlePhase('done');
    }
  }, [titlePhase]);

  // カーソル点滅
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // 文字送りエフェクト
  useEffect(() => {
    if (!isPlaying) return;

    const currentText = scenes[currentScene]?.text || '';

    if (charIndex < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentText[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const nextTimer = setTimeout(() => {
        if (currentScene < totalScenes - 1) {
          setCurrentScene(prev => prev + 1);
          setDisplayedText('');
          setCharIndex(0);
        }
      }, scenes[currentScene]?.duration - (currentText.length * 50));
      return () => clearTimeout(nextTimer);
    }
  }, [isPlaying, charIndex, currentScene]);

  // コマンド画面表示
  const startAnimation = useCallback(() => {
    setShowCommand(true);
    setSelectedCommand(0);
    setCommandConfirmed(false);
  }, []);

  // コマンド選択確定
  const confirmCommand = useCallback((index) => {
    setSelectedCommand(index);
    setCommandConfirmed(true);

    if (index === 0) {
      // BGM即再生
      if (!bgmRef.current) {
        const audio = new Audio('/bgm.m4a');
        audio.loop = false;
        audio.volume = 1.0;
        audio.addEventListener('ended', () => {
          audio.currentTime = 0;
          audio.pause();
        });
        bgmRef.current = audio;
      }
      bgmRef.current.play().catch(() => {});
      // 800ms後に画面遷移
      setTimeout(() => {
        setShowCommand(false);
        setIsPlaying(true);
        setCurrentScene(0);
        setDisplayedText('');
        setCharIndex(0);
      }, 800);
    }
  }, []);

  // リセット
  const resetAnimation = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentScene(0);
    setDisplayedText('');
    setCharIndex(0);
    setShowCommand(false);
    setCommandConfirmed(false);
    setTitlePhase('black');
  }, []);

  const currentSceneData = scenes[currentScene];

  // ========== DQ3風タイトル画面 ==========
  if (titlePhase !== 'done') {
    return (
      <div
        onClick={dismissTitle}
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"DotGothic16", monospace',
          cursor: titlePhase === 'visible' ? 'pointer' : 'default',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* タイトルテキスト */}
        <div style={{
          opacity: titlePhase === 'black' ? 0 : titlePhase === 'fadeIn' ? 1 : 1,
          transition: 'opacity 2s ease-in',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(36px, 7vw, 72px)',
            letterSpacing: '0.2em',
            textShadow: '0 0 20px rgba(255,255,255,0.3)',
            margin: 0
          }}>
            冒険の書
          </h1>
          <h2 style={{
            color: '#fff',
            fontSize: 'clamp(28px, 5.5vw, 56px)',
            letterSpacing: '0.2em',
            textShadow: '0 0 20px rgba(255,255,255,0.3)',
            margin: 0
          }}>
            ダンドリな会へ
          </h2>
        </div>

        {/* クリック促し */}
        {titlePhase === 'visible' && (
          <div style={{
            position: 'absolute',
            bottom: '80px',
            color: '#888',
            fontSize: 'clamp(14px, 2vw, 24px)',
            letterSpacing: '0.1em',
            animation: 'blink 1.2s infinite'
          }}>
            ▶ PRESS START
          </div>
        )}

        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // ========== メイン画面 ==========
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"DotGothic16", monospace',
      overflow: 'hidden',
      position: 'relative'
    }}>

      {/* メインコンテナ */}
      <div style={{
        width: '90%',
        maxWidth: '1200px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>

        {/* スタート画面 */}
        {!isPlaying && !showCommand && currentScene === 0 && displayedText === '' && (
          <div style={{
            textAlign: 'center',
            color: '#fff'
          }}>
            <h1 style={{
              fontSize: 'clamp(40px, 8vw, 80px)',
              marginBottom: '30px',
              letterSpacing: '0.15em'
            }}>
              冒険の書
            </h1>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 56px)',
              marginBottom: '50px',
              letterSpacing: '0.1em'
            }}>
              ダンドリな会
            </h2>
            <p style={{
              fontSize: 'clamp(18px, 3vw, 32px)',
              marginBottom: '60px',
              color: '#ccc'
            }}>
              2026年2月4日（水）13:00〜18:00
            </p>
            <button
              onClick={startAnimation}
              style={{
                padding: '24px 72px',
                fontSize: 'clamp(24px, 4vw, 40px)',
                backgroundColor: '#000',
                color: '#fff',
                border: '6px solid #fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.2em'
              }}
            >
              ▶ START
            </button>
          </div>
        )}

        {/* コマンド選択画面 */}
        {showCommand && !isPlaying && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px'
          }}>
            <div style={{
              border: '8px solid #fff',
              backgroundColor: '#000',
              padding: '16px',
              minWidth: '400px'
            }}>
              <div style={{
                textAlign: 'center',
                borderBottom: '4px solid #888',
                paddingBottom: '20px',
                marginBottom: '24px'
              }}>
                <span style={{
                  color: '#fff',
                  fontSize: 'clamp(28px, 5vw, 48px)',
                  letterSpacing: '0.3em'
                }}>
                  コマンド
                </span>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                padding: '16px 32px',
                alignItems: 'center'
              }}>
                {commands.map((cmd, index) => (
                  <div
                    key={index}
                    onClick={() => !commandConfirmed && confirmCommand(index)}
                    style={{
                      color: '#fff',
                      fontSize: 'clamp(24px, 4vw, 40px)',
                      cursor: commandConfirmed ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      backgroundColor: (commandConfirmed && selectedCommand === index)
                        ? 'rgba(255,255,255,0.2)'
                        : 'transparent'
                    }}
                  >
                    <span style={{
                      opacity: (commandConfirmed && selectedCommand === index) ? 1 : 0,
                      fontSize: 'clamp(20px, 3.5vw, 36px)'
                    }}>
                      ▶
                    </span>
                    <span>{cmd.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {commandConfirmed && selectedCommand === 0 && (
              <div style={{
                color: '#fff',
                fontSize: 'clamp(24px, 4vw, 40px)'
              }}>
                いざ、戦いの時！
              </div>
            )}

            {commandConfirmed && selectedCommand !== 0 && (
              <div style={{
                color: '#fff',
                fontSize: 'clamp(20px, 3vw, 32px)',
                display: 'flex',
                alignItems: 'center',
                gap: '24px'
              }}>
                <span>今は「たたかう」時だ！</span>
                <button
                  onClick={() => setCommandConfirmed(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '4px solid #fff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'clamp(18px, 2.5vw, 28px)'
                  }}
                >
                  戻る
                </button>
              </div>
            )}
          </div>
        )}

        {/* メッセージウィンドウ */}
        {isPlaying && (
          <div style={{
            width: '100%',
            padding: '16px',
            boxSizing: 'border-box'
          }}>
            <div style={{
              border: '8px solid #fff',
              padding: '8px',
              backgroundColor: '#000'
            }}>
              <div style={{
                border: '4px solid #888',
                padding: 'clamp(32px, 6vw, 64px)',
                minHeight: 'clamp(180px, 30vw, 320px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: currentSceneData?.isTitle ? 'center' : 'flex-start'
              }}>
                <p style={{
                  color: '#fff',
                  fontSize: currentSceneData?.isTitle
                    ? 'clamp(36px, 7vw, 72px)'
                    : 'clamp(24px, 5vw, 48px)',
                  lineHeight: '2.2',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  letterSpacing: '0.1em',
                  textAlign: currentSceneData?.isTitle ? 'center' : 'left'
                }}>
                  {displayedText}
                  {charIndex < (scenes[currentScene]?.text?.length || 0) && (
                    <span style={{
                      opacity: showCursor ? 1 : 0,
                      marginLeft: '2px'
                    }}>▌</span>
                  )}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '32px'
            }}>
              {scenes.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: index <= currentScene ? '#fff' : '#444',
                    border: '3px solid #fff'
                  }}
                />
              ))}
            </div>

            {charIndex >= (scenes[currentScene]?.text?.length || 0) &&
             currentScene < totalScenes - 1 && (
              <div style={{
                position: 'absolute',
                bottom: '100px',
                right: '100px',
                color: '#fff',
                fontSize: '36px',
                animation: 'bounce 0.5s infinite alternate'
              }}>
                ▼
              </div>
            )}
          </div>
        )}

        {/* 終了画面 */}
        {isPlaying && currentScene === totalScenes - 1 &&
         charIndex >= scenes[totalScenes - 1].text.length && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            display: 'flex',
            gap: '20px'
          }}>
            <button
              onClick={resetAnimation}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                backgroundColor: 'transparent',
                color: '#888',
                border: '2px solid #888',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              もう一度
            </button>
          </div>
        )}
      </div>

      {/* プログレスバー */}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          maxWidth: '600px',
          height: '10px',
          backgroundColor: '#333',
          border: '3px solid #fff'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#fff',
            width: `${((currentScene + 1) / totalScenes) * 100}%`,
            transition: 'width 0.5s'
          }} />
        </div>
      )}

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(5px); }
        }
      `}</style>
    </div>
  );
};

export default DandoriOpening;
