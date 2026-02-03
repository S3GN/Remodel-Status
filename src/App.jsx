import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Globe, CheckSquare, Square, AlertCircle, Camera, Eye, EyeOff } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import H2C from './components/h2c';   // 📸 캡처 컴포넌트 추가

const SHIP_GROUPS = [
  { title: "BB/BC", types: ["BB", "FBB", "BBV", "XBB"] },
  { title: "CV/CVL", types: ["CV", "CVB", "CVL"] },
  { title: "CA", types: ["CA", "CAV"] },
  { title: "AV/AO/AS..", types: ["AV", "AS", "LHA", "AO", "AR"] },
  { title: "DE", types: ["DE"] },
  { title: "CL", types: ["CL", "CLT", "CT"] },
  { title: "DD", types: ["DD"] },
  { title: "SS", types: ["SS", "SSV"] }
];

const UI_TEXT = {
  kr: { 
    title: "설계도표", 
    notOwned: "미보유",
    levelingDone: "레벨링 완료",
    guide: "카드를 클릭하면 <strong>개장 완료</strong> 처리됩니다.",
    viewAll: "전체 보기", viewIncomplete: "미개장만 보기", exportImage: "이미지 저장",
    disclaimer: "※ 본 툴은 비공식 2차 창작물이며, 데이터 오류 및 사용상의 불이익에 대해 책임지지 않습니다.",
    contact: "오류 제보 및 문의:",
    serverNotice: "데이터는 서버에 저장되지 않습니다 | 익명 통계 수집"
  },
  jp: { 
    title: "改装設計図管理表", 
    notOwned: "未保有",
    levelingDone: "レベリング完了",
    guide: "カードをクリックすると<strong>改装完了</strong>になります。",
    viewAll: "すべて表示", viewIncomplete: "未改装のみ", exportImage: "画像保存",
    disclaimer: "※ 本ツールは非公式であり、使用による不利益について一切の責任を負いません。",
    contact: "お問い合わせ:",
    serverNotice: "データはサーバーに保存されません | 匿名統計収集"
  },
  en: { 
    title: "Ship Remodel Status", 
    notOwned: "Not Owned",
    levelingDone: "Leveling Done",
    guide: "Click card to mark as <strong>Remodel Complete</strong>.",
    viewAll: "Show All", viewIncomplete: "Incomplete Only", exportImage: "Save Image",
    disclaimer: "※ Unofficial tool. No responsibility is taken for errors or issues caused by use.",
    contact: "Contact/Report:",
    serverNotice: "Data is not saved on server | Anonymous Statistics"
  }
};

const MATERIAL_ICONS = {
  blueprint: "blueprint.png",
  report: "report.png",
  catapult: "catapult.png",
  gunMat: "gun.png",
  airMat: "air.png",
  armMat: "arm.png",
  devMat: "dev.png",
  torch: "torch.png",
  boiler: "boiler.png",
  osmat: "os.png",
  screw: "screw.png"
};

// ==================================================
// 💎 함선 카드 컴포넌트 (디자인 유지 + Export 모드 지원)
// ==================================================
function ShipCard({ ship, userData, language, onToggleState, isExportMode = false }) {
  const displayName = ship.names[language] || ship.names.en;
  const imageFileName = ship.id;
  
  const isNotOwned = userData?.notOwned || false;
  const isLevelingDone = userData?.levelingDone || false;
  const isRemodelDone = userData?.remodelDone || false;

  const handleCardClick = (e) => {
    if (isExportMode) return;
    if (e.target.closest('.checkbox-area')) return;
    onToggleState(ship.id, 'remodelDone');
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`
        flex items-center h-16 rounded-xl border shadow-sm overflow-hidden transition-all relative select-none
        ${isExportMode ? '' : 'cursor-pointer'}
        ${isRemodelDone 
          ? 'bg-[#e5e7eb] border-[#d1d5db] grayscale opacity-70' // bg-gray-200, border-gray-300
          : 'bg-[#ffffff] border-[#e5e7eb] hover:shadow-md hover:border-[#60a5fa]'} // bg-white, border-gray-200, hover:border-blue-400
      `}
    >
      {/* 1. 좌측 이미지 영역 */}
      <div className="w-32 md:w-64 h-full flex-shrink-0 border-r border-[#e5e7eb] relative bg-[#f3f4f6]"> {/* border-gray-200, bg-gray-100 */}
        <img 
          src={`${import.meta.env.BASE_URL}ships/${imageFileName}.png`} 
          alt={displayName}
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://via.placeholder.com/200x100/E5E7EB/9CA3AF?text=" + ship.type;
          }}
        />
      </div>

      {/* 2. 정보 및 체크박스 영역 */}
      <div className="flex-1 flex justify-between items-center p-4 min-w-0">
        <div className="flex flex-col gap-1 min-w-0 pr-2">
          {/* 이름 & 레벨 */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-lg leading-tight truncate ${isRemodelDone ? 'text-[#6b7280] line-through' : 'text-[#111827]'}`}> {/* text-gray-500, text-gray-900 */}
              {displayName}
            </h3>
            {ship.remodelLevel > 0 && (
              <span 
                className={`text-sm font-bold shrink-0 px-1.5 rounded ${isLevelingDone ? 'bg-[#dcfce7] text-[#15803d]' : 'text-[#F8B62D]'}`} // bg-green-100, text-green-700
              >
                Lv.{ship.remodelLevel}
              </span>
            )}
          </div>
          
          {/* 자재 아이콘 영역 */}
          <div className="flex flex-wrap gap-4 items-center">
            {Object.entries(ship.materials).map(([key, count]) => {
              if (count <= 0) return null;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <img 
                    src={`${import.meta.env.BASE_URL}items/${MATERIAL_ICONS[key]}`} 
                    className={`w-6 h-6 object-contain drop-shadow-sm ${isRemodelDone ? 'opacity-50' : ''}`} 
                    alt={key} 
                  />
                  <span className={`text-lg ${isRemodelDone ? 'text-[#9ca3af]' : 'text-[#1f2937]'}`}> {/* text-gray-400, text-gray-800 */}
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. 우측 체크박스 */}
        <div className="checkbox-area flex flex-col gap-2 text-sm text-[#374151] shrink-0 border-l border-[#f3f4f6] pl-4 py-1"> {/* text-gray-700, border-gray-100 */}
          <label className={`flex items-center gap-2 ${isExportMode ? '' : 'cursor-pointer hover:text-[#dc2626]'} transition-colors`}> {/* hover:text-red-600 */}
            <div onClick={() => !isExportMode && onToggleState(ship.id, 'notOwned')} className="relative flex items-center">
              {isNotOwned 
                ? <CheckSquare className="w-5 h-5 text-[#ef4444]" /> // text-red-500
                : <Square className="w-5 h-5 text-[#d1d5db]" />}
            </div>
            <span className={isNotOwned ? "font-bold text-[#ef4444]" : "text-[#9ca3af]"}> {/* text-red-500, text-gray-400 */}
              {UI_TEXT[language].notOwned}
            </span>
          </label>

          <label className={`flex items-center gap-2 ${isExportMode ? '' : 'cursor-pointer hover:text-[#16a34a]'} transition-colors`}> {/* hover:text-green-600 */}
            <div onClick={() => !isExportMode && onToggleState(ship.id, 'levelingDone')} className="relative flex items-center">
              {isLevelingDone 
                ? <CheckSquare className="w-5 h-5 text-[#16a34a]" /> // text-green-600
                : <Square className="w-5 h-5 text-[#d1d5db]" />}
            </div>
            <span className={isLevelingDone ? "font-bold text-[#16a34a]" : "text-[#9ca3af]"}> {/* text-green-600, text-gray-400 */}
              {UI_TEXT[language].levelingDone}
            </span>
          </label>
        </div>
      </div>
      
      {!isRemodelDone && !isExportMode && (
         <div className="absolute inset-0 hover:bg-[#3b82f6]/5 transition-colors pointer-events-none" />
      )}
    </div>
  );
}


// ==================================================
// 🚀 메인 앱
// ==================================================
export default function KanColleBlueprintTable() {
  const [masterShips, setMasterShips] = useState([]);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("kancolle_user_data_v8");
    return saved ? JSON.parse(saved) : {};
  });
  const [language, setLanguage] = useState("kr"); 
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false); // 📸 필터 상태 추가

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/ships.csv`).then(res => res.text()).then(text => {
      const lines = text.trim().split('\n');
      const loadedShips = lines.map((line) => {
        const cols = line.split(',').map(c => c.trim());
        if (cols.length < 6) return null;
        return {
          id: cols[0],
          names: { en: cols[1], jp: cols[2], kr: cols[3] },
          type: cols[4],
          remodelLevel: Number(cols[5]) || 0,
          materials: {
            blueprint: Number(cols[6]) || 0,
            report: Number(cols[7]) || 0,
            catapult: Number(cols[8]) || 0,
            gunMat: Number(cols[9]) || 0,
            airMat: Number(cols[10]) || 0,
            armMat: Number(cols[11]) || 0,
            devMat: Number(cols[12]) || 0,
            torch: Number(cols[13]) || 0,
            boiler: Number(cols[14]) || 0,
            osmat: Number(cols[15]) || 0,
            screw: Number(cols[16]) || 0
          }
        };
      }).filter(item => item !== null);
      setMasterShips(loadedShips);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("kancolle_user_data_v8", JSON.stringify(userData));
  }, [userData]);
  
  useEffect(() => {
    document.title = UI_TEXT[language].title;
  }, [language]);

  const toggleState = (id, field) => {
    setUserData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: !prev[id]?.[field]
      }
    }));
  };

  const stats = useMemo(() => {
     return masterShips
      .filter(s => !userData[s.id]?.remodelDone)
      .reduce((acc, curr) => ({
        bp: acc.bp + curr.materials.blueprint,
        report: acc.report + curr.materials.report,
        catapult: acc.catapult + curr.materials.catapult
      }), { bp: 0, report: 0, catapult: 0 });
  }, [masterShips, userData]);

  // 📸 이미지 내보내기 핸들러 (수정됨)
  const handleExportImage = async () => {
    const element = document.getElementById('export-target');
    if (!element) return;

    try {
      const dataUrl = await toJpeg(element, { 
        cacheBust: true,
        backgroundColor: '#ffffff',
        quality: 0.9,
        pixelRatio: 2,
        // 🔥 [중요] 폰트 파싱 오류 방지 옵션들
        skipAutoScale: true, 
        fontEmbedCSS: '', // 폰트 강제 삽입 시도 중단 (index.html에서 불러오므로 괜찮음)
      });

      const link = document.createElement('a');
      link.download = `kancolle-plan-${new Date().toISOString().slice(0,10)}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Capture failed:", err);
      alert("이미지 저장 실패: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-['Noto_Sans_JP','Noto_Sans_KR',sans-serif] text-gray-900 pb-20">

      {/* 📸 화면 밖 캡처 뷰 */}
      <H2C 
        id="export-target"
        groups={SHIP_GROUPS}
        masterShips={masterShips}
        userData={userData}
        language={language}
        stats={stats}
        uiText={UI_TEXT[language]}
        showIncompleteOnly={showIncompleteOnly}
        ShipCardComponent={ShipCard}
      />

      <div className="max-w-5xl mx-auto">

      {/* 🔥 상단 컨트롤 바 (면책조항 + 필터/저장/언어) */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-3 mb-3">
          
          {/* [추가된 부분] 좌측: 면책 조항 및 이메일 */}
          <div className="text-xs text-gray-400 leading-relaxed mb-1 md:mb-0 text-left w-full md:w-auto">
            <p>{UI_TEXT[language].disclaimer}</p>
            <p className="flex items-center gap-1">
              {UI_TEXT[language].contact} 
              <span className="font-mono text-gray-500 select-all hover:text-blue-500 cursor-pointer transition-colors">
                {/* 👇 여기에 아까 만드신 이메일 주소를 넣으세요! */}
                shou3n@proton.me
              </span>
            </p>
          </div>

          {/* 우측: 버튼 그룹 (기존 버튼들을 div로 한 번 감싸줍니다) */}
          <div className="flex items-center gap-3 self-end">
            {/* 필터 버튼 */}
            <button 
              onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold transition-all shadow-sm ${showIncompleteOnly ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
            >
              {showIncompleteOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showIncompleteOnly ? UI_TEXT[language].viewIncomplete : UI_TEXT[language].viewAll}
            </button>
            
            {/* 저장 버튼 */}
            <button 
              onClick={handleExportImage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 hover:text-blue-600 shadow-sm"
            >
              <Camera className="w-4 h-4" />
              {UI_TEXT[language].exportImage}
            </button>
            
            {/* 언어 선택 */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer">
              <Globe className="w-4 h-4 text-gray-500" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none text-gray-700 cursor-pointer appearance-none pr-1"
              >
                <option value="kr">한국어</option>
                <option value="jp">日本語</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* === 헤더 (기존 디자인 유지) === */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-30 flex flex-wrap justify-between items-center gap-6 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">

            <div>
              <h1 className="text-4xl font-black leading-none text-gray-800 tracking-tight">
                {UI_TEXT[language].title}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">{UI_TEXT[language].subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-6 text-sm font-bold bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <img src={`${import.meta.env.BASE_URL}items/blueprint.png`} className="w-6 h-6 object-contain" alt="BP" />
                <span className="text-blue-700 text-lg">{stats.bp}</span>
              </div>
              <div className="w-px bg-gray-300 h-5"></div>
              <div className="flex items-center gap-2">
                <img src={`${import.meta.env.BASE_URL}items/report.png`} className="w-6 h-6 object-contain" alt="Report" />
                <span className="text-orange-700 text-lg">{stats.report}</span>
              </div>
              {stats.catapult > 0 && (
                <>
                  <div className="w-px bg-gray-300 h-5"></div>
                  <div className="flex items-center gap-2">
                    <img src={`${import.meta.env.BASE_URL}items/catapult.png`} className="w-6 h-6 object-contain" alt="Cat" />
                    <span className="text-purple-700 text-lg">{stats.catapult}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 알림 문구 */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 px-2">
          <AlertCircle className="w-4 h-4" />
          <span dangerouslySetInnerHTML={{ __html: UI_TEXT[language].guide }}></span>
        </div>

        {/* === 메인 리스트 === */}
        <div className="space-y-10">
          {SHIP_GROUPS.map((group) => {
            const groupShips = masterShips.filter(ship => {
              const typeMatch = group.types.includes(ship.type);
              const isComplete = userData[ship.id]?.remodelDone;
              // 📸 필터 적용: showIncompleteOnly가 true면, 완료된 배는 숨김
              if (showIncompleteOnly && isComplete) return false;
              return typeMatch;
            });

            if (groupShips.length === 0) return null;

            return (
              <div key={group.title} className="animate-fade-in">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  {group.title}
                  <div className="h-px flex-1 bg-gray-200"></div>
                </h2>

                <div className="flex flex-col gap-3">
                  {groupShips.map((ship) => (
                    <ShipCard 
                      key={ship.id} 
                      ship={ship}
                      language={language}
                      userData={userData[ship.id]}
                      onToggleState={toggleState}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-20 mb-10 text-center border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 flex flex-col items-center gap-1">
            <span>{UI_TEXT[language].serverNotice}</span>
            <span className="opacity-50">© 2026 S3GN</span>
          </p>
        </div>
      </div>
    </div>
  );
}