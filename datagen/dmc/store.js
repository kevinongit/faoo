checkGenComparison: async (zone_nm, smb_sector, zoneRange, sectorRange, revenueRange) => {
  try {
    const response = await fetch("http://localhost:3400/gen-data-temporary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        zone_nm,
        smb_sector,
        zoneRange,
        sectorRange,
        revenueRange,
      }),
    });

    if (!response.ok) {
      throw new Error("비교 그룹 생성에 실패했습니다.");
    }

    const result = await response.json();
    return result.status === "success";
  } catch (error) {
    console.error("Error checking comparison generation:", error);
    return false;
  }
}, 