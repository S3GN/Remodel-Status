import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Globe, CheckSquare, Square, AlertCircle } from 'lucide-react';

const SHIP_GROUPS = [
  { title: "BB/BC", types: ["BB", "FBB", "BBV", "XBB"] },
  { title: "CV/CVL", types: ["CV", "CVB", "CVL"] },
  { title: "CA", types: ["CA", "CAV"] },
  { title: "CL", types: ["CL", "CLT", "CT"] },
  { title: "DD", types: ["DD"] },
  { title: "DE", types: ["DE"] },
  { title: "SS", types: ["SS", "SSV"] },
  { title: "AV/AO/AS..", types: ["AV", "AS", "LHA", "AO", "AR", "DE"] }
];

const UI_TEXT = {
  kr: { 
    title: "설계도표", 
    notOwned: "미보유",
    levelingDone: "레벨링 완료",
    guide: "카드를 클릭하면 <strong>개장 완료</strong> 처리됩니다."
  },
  jp: { 
    title: "改装設計図管理表", 
    notOwned: "未保有",
    levelingDone: "レベリング完了", // 또는 'Lv完了'
    guide: "カードをクリックすると<strong>改装完了</strong>になります。"
  },
  en: { 
    title: "Blueprint Planner", 
    notOwned: "Not Owned",
    levelingDone: "Leveling Done",
    guide: "Click card to mark as <strong>Remodel Complete</strong>."
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
  boiler: "boiler.png"
};

// ==================================================
// 💎 함선 카드 컴포넌트
// ==================================================
function ShipCard({ ship, userData, language, onToggleState }) {
  const displayName = ship.names[language] || ship.names.en;
  const imageFileName = ship.id;
  
  // 상태값 분리
  const isNotOwned = userData?.notOwned || false;      // 미보유
  const isLevelingDone = userData?.levelingDone || false; // 레벨링 완료 (자재 필요함)
  const isRemodelDone = userData?.remodelDone || false;   // 개장 완료 (최종 완료)

  // 카드 클릭 시 '개장 완료(Remodel Done)' 토글
  const handleCardClick = (e) => {
    // 체크박스 클릭 시 카드 클릭 이벤트 방지
    if (e.target.closest('.checkbox-area')) return;
    onToggleState(ship.id, 'remodelDone');
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`
        flex items-center h-16 rounded-xl border shadow-sm overflow-hidden transition-all cursor-pointer select-none relative
        ${isRemodelDone 
          ? 'bg-gray-200 border-gray-300 grayscale opacity-70'  /* 개장 완료: 회색 + 흐림 */
          : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-400'} /* 진행 중: 흰색 */
      `}
    >
      {/* 1. 좌측 이미지 영역 */}
      <div className="w-32 md:w-64 h-full flex-shrink-0 border-r border-gray-200 relative bg-gray-100">
        <img 
          src={`/ships/${imageFileName}.png`} 
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
            <h3 className={`font-bold text-lg leading-tight truncate ${isRemodelDone ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {displayName}
            </h3>
            {ship.remodelLevel > 0 && (
              <span 
                className={`text-sm font-bold shrink-0 px-1.5 rounded ${isLevelingDone ? 'bg-green-100 text-green-700' : 'text-[#F8B62D]'}`}
              >
                Lv.{ship.remodelLevel}
              </span>
            )}
          </div>
          
      {/* 🔥 자재 아이콘 영역 (박스 제거됨) */}
          <div className="flex flex-wrap gap-4 items-center">
            {Object.entries(ship.materials).map(([key, count]) => {
              if (count <= 0) return null;
              return (
                // 박스(border, bg) 제거하고 아이콘과 글자만 남김
                <div key={key} className="flex items-center gap-1.5">
                  {/* 아이콘 크기 확대: w-5(20px) -> w-7(28px) */}
                  <img 
                    src={`/items/${MATERIAL_ICONS[key]}`} 
                    className={`w-6 h-6 object-contain drop-shadow-sm ${isRemodelDone ? 'opacity-50' : ''}`} 
                    alt={key} 
                  />
                  {/* 숫자 크기 확대: text-sm -> text-lg */}
                  <span className={`text-lg  ${isRemodelDone ? 'text-gray-400' : 'text-gray-800'}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. 우측 체크박스 (다국어 적용됨) */}
        <div className="checkbox-area flex flex-col gap-2 text-sm text-gray-700 shrink-0 border-l border-gray-100 pl-4 py-1">
          <label className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors">
            <div onClick={() => onToggleState(ship.id, 'notOwned')} className="relative flex items-center">
              {isNotOwned 
                ? <CheckSquare className="w-5 h-5 text-red-500" /> 
                : <Square className="w-5 h-5 text-gray-300" />}
            </div>
            {/* 🔥 다국어 텍스트 적용 */}
            <span className={isNotOwned ? "font-bold text-red-500" : "text-gray-400"}>
              {UI_TEXT[language].notOwned}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors">
            <div onClick={() => onToggleState(ship.id, 'levelingDone')} className="relative flex items-center">
              {isLevelingDone 
                ? <CheckSquare className="w-5 h-5 text-green-600" /> 
                : <Square className="w-5 h-5 text-gray-300" />}
            </div>
            {/* 🔥 다국어 텍스트 적용 */}
            <span className={isLevelingDone ? "font-bold text-green-600" : "text-gray-400"}>
              {UI_TEXT[language].levelingDone}
            </span>
          </label>
        </div>
      </div>
      
      {/* 카드 클릭 안내 툴팁 (마우스 오버 시) */}
      {!isRemodelDone && (
         <div className="absolute inset-0 bg-blue-500/0 hover:bg-blue-500/5 transition-colors pointer-events-none" />
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
    const saved = localStorage.getItem("kancolle_user_data_v7");
    return saved ? JSON.parse(saved) : {};
  });
  const [language, setLanguage] = useState("kr"); 

  useEffect(() => {
    fetch('/ships.csv').then(res => res.text()).then(text => {
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
            boiler: Number(cols[14]) || 0
          }
        };
      }).filter(item => item !== null);
      setMasterShips(loadedShips);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("kancolle_user_data_v7", JSON.stringify(userData));
  }, [userData]);

  // 상태 토글 핸들러 (field: 'notOwned' | 'levelingDone' | 'remodelDone')
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
      // 중요: 개장 완료(remodelDone)가 아닐때만 자재 계산
      .filter(s => !userData[s.id]?.remodelDone)
      .reduce((acc, curr) => ({
        bp: acc.bp + curr.materials.blueprint,
        report: acc.report + curr.materials.report,
        catapult: acc.catapult + curr.materials.catapult
      }), { bp: 0, report: 0, catapult: 0 });
  }, [masterShips, userData]);

  return (
    <div className="min-h-screen  p-4 md:p-8 font-['Noto_Sans_KR',sans-serif] text-gray-900 pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
        body { font-family: 'Noto Sans KR', sans-serif; }
      `}</style>

      <div className="max-w-5xl mx-auto">

      {/* 🔥 [위치 변경됨] 언어 선택 박스 (헤더 위쪽 우상단) */}
        <div className="flex justify-end mb-3">
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
        {/* === 헤더 === */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-30 flex flex-wrap justify-between items-center gap-6 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400 rounded-xl shadow-sm text-white">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-none text-gray-800 tracking-tight">
                {UI_TEXT[language].title}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">{UI_TEXT[language].subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 자재 통계 */}
            <div className="flex gap-6 text-sm font-bold bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <img src="/items/blueprint.png" className="w-6 h-6 object-contain" alt="BP" />
                <span className="text-blue-700 text-lg">{stats.bp}</span>
              </div>
              <div className="w-px bg-gray-300 h-5"></div>
              <div className="flex items-center gap-2">
                <img src="/items/report.png" className="w-6 h-6 object-contain" alt="Report" />
                <span className="text-orange-700 text-lg">{stats.report}</span>
              </div>
              {stats.catapult > 0 && (
                <>
                  <div className="w-px bg-gray-300 h-5"></div>
                  <div className="flex items-center gap-2">
                    <img src="/items/catapult.png" className="w-6 h-6 object-contain" alt="Cat" />
                    <span className="text-purple-700 text-lg">{stats.catapult}</span>
                  </div>
                </>
              )}
            </div>


          </div>
        </div>



        {/* === 메인 리스트 === */}
        <div className="space-y-10">
          {SHIP_GROUPS.map((group) => {
            const groupShips = masterShips.filter(ship => group.types.includes(ship.type));
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
      </div>
    </div>
  );
}