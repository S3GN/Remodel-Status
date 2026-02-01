import React from 'react';

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

export default function H2C({ 
  id,           
  groups,       
  masterShips,  
  userData,     
  language,     
  stats,        
  uiText,       
  showIncompleteOnly
}) {
  
  const renderExportCard = (ship) => {
    const displayName = ship.names[language] || ship.names.en;
    const imageFileName = ship.id;
    
    const isNotOwned = userData[ship.id]?.notOwned;
    const isRemodelDone = userData[ship.id]?.remodelDone;
    const isLevelingDone = userData[ship.id]?.levelingDone;

    return (
      <div 
        key={ship.id}
        className={`
          flex h-[50px]  bg-white overflow-hidden relative
          ${isRemodelDone ? 'grayscale opacity-60' : ''}
        `}
      >
        {/* 1. 왼쪽: 함선 이미지 */}
        <div className="w-[200px] h-[50px] flex-shrink-0 relative border-r border-[#f3f4f6]">
          <img 
            src={`${import.meta.env.BASE_URL}ships/${imageFileName}.png`} 
            alt={displayName}
            className="h-full w-full object-cover object-center" 
            crossOrigin="anonymous"

            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            }}
          />
        </div>

        {/* 2. 오른쪽: 정보 영역 */}
        <div className="flex-1 flex flex-col justify-between px-3 py-1 min-w-0 bg-[#ffffff] whitespace-nowrap border-b border-[#e5e7eb]">
          
          {/* 윗줄: 이름 + 레벨 */}
          <div className="flex items-center gap-2 leading-none">
            <div className="flex items-center gap-1.5 flex-1 min-w-[140px] overflow-hidden">
              <span className={`text-[14px] font-bold -mt-0.5 ${isRemodelDone ? 'line-through text-[#9ca3af]' : 'text-[#1f2937]'}`}>
                {displayName}
              </span>
              {ship.remodelLevel > 0 && (
                <span className={`text-[11px] font-bold px-1 rounded-sm flex-shrink-0 ${isLevelingDone ? 'text-[#16a34a] bg-[#dcfce7]' : 'text-[#d97706] bg-[#fef3c7]'}`}>
                  Lv.{ship.remodelLevel}
                </span>
              )}
            </div>
          </div>

          {/* 아랫줄: 자재 아이콘 */}
          <div className="flex items-center gap-3 overflow-hidden">
            {Object.entries(ship.materials).map(([key, count]) => {
              if (count <= 0) return null;
              return (
                <div key={key} className="flex items-center gap-1 flex-shrink-0">
                  <img src={`${import.meta.env.BASE_URL}items/${MATERIAL_ICONS[key]}`} className="w-6 h-6 object-contain" alt={key} />
                  <span className="text-[13px] font-bold text-[#374151] font-mono leading-none">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 🔥 [수정됨] 상태 마커 (수직 중앙 정렬 + X 두껍게) */}
        {/* 공통 클래스: absolute top-1/2 right-4 -translate-y-1/2 (완벽한 중앙 배치) */}
        
        {isRemodelDone ? (
          // 1. 개장 완료: 녹색 체크
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#22c55e] font-black text-2xl opacity-30 pointer-events-none leading-none">
            ✓
          </div>
        ) : isNotOwned ? (
          // 2. 미보유: 검은색 두꺼운 X (SVG 사용)
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#111827] pointer-events-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </div>
        ) : isLevelingDone ? (
          // 3. 레벨링 완료: 파란색 동그라미 (조금 더 두껍게)
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-[4px] border-[#3b82f6] pointer-events-none"></div>
        ) : null}
      </div>
    );
  };

  const renderGroup = (group) => {
    const groupShips = masterShips.filter(ship => {
      const typeMatch = group.types.includes(ship.type);
      const isComplete = userData[ship.id]?.remodelDone;
      if (showIncompleteOnly && isComplete) return false;
      return typeMatch;
    });

    if (groupShips.length === 0) return null;

    return (
      <div key={group.title} className="mb-6 break-inside-avoid px-2">
        <h2 className="font-bold text-[#111827] text-sm mb-0 border-b-2 border-[#1f2937] pb-1 flex justify-between items-end">
          <span className="whitespace-nowrap">{group.title}</span>
          
        </h2>
        <div className="flex flex-col">
          {groupShips.map(ship => renderExportCard(ship))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: 0, overflow: 'hidden' }}>
      <div 
        id={id} 
        className="bg-white p-8"
        style={{ width: '1200px' }} 
      >
        <div className="mb-8 border-b border-[#e5e7eb] pb-5 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-[#111827] tracking-tight">{uiText.title}</h1>
          </div>
          
          <div className="flex gap-6 text-base font-bold bg-[#f9fafb] px-6 py-3 rounded-lg border border-[#e5e7eb]">
             <div className="flex items-center gap-2"><img src={`${import.meta.env.BASE_URL}items/blueprint.png`} className="w-6 h-6 object-contain"/> <span className="text-[#1d4ed8] text-xl">{stats.bp}</span></div>
             <div className="flex items-center gap-2"><img src={`${import.meta.env.BASE_URL}items/report.png`} className="w-6 h-6 object-contain"/> <span className="text-[#c2410c] text-xl">{stats.report}</span></div>
             {stats.catapult > 0 && <div className="flex items-center gap-2"><img src={`${import.meta.env.BASE_URL}items/catapult.png`} className="w-6 h-6 object-contain"/> <span className="text-[#7e22ce] text-xl">{stats.catapult}</span></div>}
          </div>
        </div>
        
        <div className="columns-2 gap-6">
          {groups.map(group => renderGroup(group))}
        </div>
      </div>
    </div>
  );
}