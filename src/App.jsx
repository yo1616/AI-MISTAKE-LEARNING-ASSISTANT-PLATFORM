import React, { useState } from 'react';

// 模拟细胞观察数据
const cellStates = {
  DIVIDING: '正在分裂',
  NORMAL: '未变化',
  DIFFERENTIATING: '正在分化',
};

const CellDivisionFeature = () => {
  // 组件状态：当前选中的细胞类型、用户选择的答案、是否显示解析
  const [selectedCellType, setSelectedCellType] = useState('dividing'); // 'dividing', 'normal', 'differentiating'
  const [userAnswer, setUserAnswer] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // 细胞特征描述（根据状态自动布局切换）
  const cellFeatures = {
    dividing: {
      title: '🔬 正在分裂的细胞',
      description: '染色质凝缩成染色体，细胞核膜消失，细胞质内可见许多小颗粒（染色体），细胞核不膨胀或消失。',
      isCorrectForQuestion: true,
    },
    normal: {
      title: '🧫 未变化的细胞',
      description: '细胞核完整，核膜清晰，染色质呈细丝状，无明显颗粒状染色体，细胞形态规则。',
      isCorrectForQuestion: false,
    },
    differentiating: {
      title: '🌱 正在分化的细胞',
      description: '细胞体积增大，出现特定细胞器（如叶绿体或液泡），但细胞核仍可见，无染色体凝缩现象。',
      isCorrectForQuestion: false,
    },
  };

  // 根据当前选中的细胞类型获取特征
  const currentFeature = cellFeatures[selectedCellType];

  // 处理用户选择答案
  const handleAnswerSelect = (answerKey) => {
    setUserAnswer(answerKey);
    setShowAnalysis(true);
  };

  // 正确答案是 'dividing'
  const isAnswerCorrect = userAnswer === 'dividing';
  const correctAnswerText = '(A) 正在進行分裂的細胞';

  // 重置答题状态
  const resetQuiz = () => {
    setUserAnswer(null);
    setShowAnalysis(false);
  };

  // 切换观察的细胞类型 (Auto Layout 示例: 不同状态渲染不同信息)
  const handleCellTypeChange = (type) => {
    setSelectedCellType(type);
    // 切换细胞类型时，可选地重置答题状态，保持独立交互
    // resetQuiz(); // 可按需取消注释
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '2rem auto', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem'
    }}>
      {/* 标题 */}
      <h2 style={{ color: '#2b7a3e', borderLeft: '4px solid #4caf50', paddingLeft: '12px' }}>
        细胞分裂特征 · 交互判断
      </h2>

      {/* ========= 第一部分：细胞观察组件（状态切换展示不同特征） ========= */}
      <div style={{ 
        background: '#f9f6e8', 
        borderRadius: '24px', 
        padding: '1.25rem',
        marginTop: '1.5rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button 
            onClick={() => handleCellTypeChange('dividing')}
            style={{
              background: selectedCellType === 'dividing' ? '#2b6e3c' : '#e0ebda',
              color: selectedCellType === 'dividing' ? 'white' : '#2b5c2a',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '40px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            正在分裂细胞
          </button>
          <button 
            onClick={() => handleCellTypeChange('normal')}
            style={{
              background: selectedCellType === 'normal' ? '#2b6e3c' : '#e0ebda',
              color: selectedCellType === 'normal' ? 'white' : '#2b5c2a',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '40px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            未变化细胞
          </button>
          <button 
            onClick={() => handleCellTypeChange('differentiating')}
            style={{
              background: selectedCellType === 'differentiating' ? '#2b6e3c' : '#e0ebda',
              color: selectedCellType === 'differentiating' ? 'white' : '#2b5c2a',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '40px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            正在分化细胞
          </button>
        </div>

        {/* Auto Layout: 根据当前选中的细胞类型展示不同的描述内容 */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '1rem 1.25rem',
          border: '1px solid #ece4cf'
        }}>
          <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '8px' }}>
            {currentFeature.title}
          </strong>
          <p style={{ margin: 0, lineHeight: 1.5, color: '#2c3a23' }}>
            {currentFeature.description}
          </p>
          {selectedCellType === 'dividing' && (
            <div style={{ marginTop: '12px', padding: '8px 12px', background: '#fff1c1', borderRadius: '16px', fontSize: '0.9rem' }}>
              🔍 显微镜下特征：染色质凝缩 + 核膜消失 → 判断为分裂期细胞
            </div>
          )}
        </div>
      </div>

      {/* ========= 第二部分：选择题组件（题干 + 选项 + 解析） ========= */}
      <div style={{
        background: '#f0f6eb',
        borderRadius: '28px',
        padding: '1.5rem',
        marginTop: '2rem',
        border: '1px solid #deecd2'
      }}>
        <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '1rem' }}>
          📝 题目回顾
        </div>
        <div style={{ 
          background: 'white', 
          padding: '14px 18px', 
          borderRadius: '20px',
          marginBottom: '20px',
          lineHeight: '1.45'
        }}>
          “某生用顯微鏡觀察洋蔥表皮細胞，發現視野中有許多扁平排列的細胞，其中一個細胞較凸出於其他細胞，其細胞核不膨脹或消失。根據以上描述，請指出此細胞正在進行哪種生理狀態或屬於什麼細胞？”
        </div>

        {/* 选项列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {[
            { key: 'dividing', label: '(A) 正在進行分裂的細胞' },
            { key: 'normal', label: '(B) 未變化的細胞' },
            { key: 'differentiating', label: '(C) 正在進行分化的細胞' },
            // 原卷有重复项，这里保留三个主要选项，符合核心逻辑
          ].map(opt => (
            <label 
              key={opt.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: userAnswer === opt.key ? '#e9f5e3' : '#ffffff',
                borderRadius: '40px',
                border: userAnswer === opt.key ? '1.5px solid #2b6e3c' : '1px solid #d9d2b6',
                cursor: 'pointer',
                transition: '0.1s'
              }}
            >
              <input
                type="radio"
                name="quizOption"
                value={opt.key}
                checked={userAnswer === opt.key}
                onChange={() => handleAnswerSelect(opt.key)}
                style={{ accentColor: '#2b6e3c' }}
              />
              <span style={{ fontWeight: userAnswer === opt.key ? '500' : 'normal' }}>{opt.label}</span>
            </label>
          ))}
        </div>

        {/* 解析区域 - 根据用户选择动态显示 */}
        {showAnalysis && (
          <div style={{
            background: '#ffffffdd',
            backdropFilter: 'blur(2px)',
            borderLeft: `4px solid ${isAnswerCorrect ? '#4caf50' : '#e67e22'}`,
            padding: '14px 18px',
            borderRadius: '20px',
            marginTop: '8px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {isAnswerCorrect ? '✅ 解析正确' : '❌ 答案解析'}
            </div>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#2c3a23' }}>
              {isAnswerCorrect ? (
                <>
                  正确选项是 <strong>{correctAnswerText}</strong>。<br/>
                  因為細胞核消失或無法辨識、出現染色體顆粒，正是細胞分裂期中（前期/中期）的典型特徵，因此該細胞正在進行分裂。
                </>
              ) : (
                <>
                  正确答案为 <strong>{correctAnswerText}</strong>。<br/>
                  描述中提到「细胞核不膨胀或消失」且「细胞内有许多小颗粒（染色体）」，此为细胞分裂过程的特征。未分化细胞核完整，分化细胞不会出现染色体凝缩现象。
                </>
              )}
            </div>
            <button
              onClick={resetQuiz}
              style={{
                marginTop: '16px',
                background: '#e0e7db',
                border: 'none',
                padding: '6px 18px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}
            >
              重新答题
            </button>
          </div>
        )}

        {/* 额外提示：模拟笔记中的“答案 (A)”区域 */}
        {!showAnalysis && (
          <div style={{ fontSize: '0.8rem', color: '#6f6a53', marginTop: '12px', textAlign: 'center' }}>
            💡 提示：根據特徵選擇最適合的選項
          </div>
        )}
      </div>

      {/* ========= 第三部分：额外/功能函数展示 (Auto Layout 示例：根据状态展示不同控制) ========= */}
      <div style={{
        marginTop: '24px',
        background: '#fef7e0',
        borderRadius: '20px',
        padding: '12px 18px',
        fontSize: '0.85rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <span>🧬 当前活跃细胞类型: <strong>{currentFeature.title}</strong></span>
        <button 
          onClick={() => {
            // 演示一个交互函数：将细胞类型重置为分裂期，并清空答题
            setSelectedCellType('dividing');
            resetQuiz();
            alert('已重置为“正在分裂细胞”并清除答题记录');
          }}
          style={{
            background: '#2b6e3c',
            color: 'white',
            border: 'none',
            borderRadius: '32px',
            padding: '6px 14px',
            cursor: 'pointer'
          }}
        >
          重置所有状态
        </button>
      </div>
    </div>
  );
};

export default CellDivisionFeature;