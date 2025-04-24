// store/salesStore.js
import { create } from "zustand";

const useSaleCompareStore = create((set, get) => ({
  apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}:6100`,
  error: null,
  rankData: {},
  fetchData: async (businessNumber, month) => {
    const HOST = get().apiUrl;
    try {
      const rankData = await fetch(`${HOST}/compareapi/v2/salesRanking`, {
        method: "POST",
        body: JSON.stringify({ business_number: businessNumber, month: month }),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());

      rankData.monthInfo.percentileRank =
        Number(rankData.monthInfo.percentileRank) * 10;

      rankData.base_month = rankData.base_date.substring(4, 6);

      const low = Number(rankData.monthInfo.totalAvg) * 0.9;
      const high = Number(rankData.monthInfo.totalAvg) * 1.1;

      let compareStr = "";
      if (
        Number(rankData.monthAmt) >= low &&
        Number(rankData.monthAmt) <= high
      ) {
        compareStr = "과 비슷해요.";
      } else if (
        Number(rankData.monthAmt) < Number(rankData.monthInfo.totalAvg)
      ) {
        compareStr = "보다 조금 낮아요.";
      } else if (
        Number(rankData.monthAmt) > Number(rankData.monthInfo.totalAvg)
      ) {
        compareStr = "보다 높아요.";
      }

      rankData.compareStr = compareStr;

      Array.from({ length: 11 }).forEach((_, index) => {
        switch (index) {
          case 0:
            rankData.monthInfo.rankList = [
              {
                key: index,
                keyNm: "전체",
                value: Math.floor(rankData.monthInfo.totalAvg),
              },
            ];
            break;
          case 1:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 10%",
              value: Math.floor(rankData.monthInfo.top10Avg),
            });
            break;
          case 2:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 11 ~ 20%",
              value: Math.floor(rankData.monthInfo.top20Avg),
            });
            break;
          case 3:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 21 ~ 30%",
              value: Math.floor(rankData.monthInfo.top30Avg),
            });
            break;
          case 4:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 31 ~ 40%",
              value: Math.floor(rankData.monthInfo.top40Avg),
            });
            break;
          case 5:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 41 ~ 50%",
              value: Math.floor(rankData.monthInfo.top50Avg),
            });
            break;
          case 6:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 51 ~ 60%",
              value: Math.floor(rankData.monthInfo.top60Avg),
            });
            break;
          case 7:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 61 ~ 70%",
              value: Math.floor(rankData.monthInfo.top70Avg),
            });
            break;
          case 8:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 71 ~ 80%",
              value: Math.floor(rankData.monthInfo.top80Avg),
            });
            break;
          case 9:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "상위 81 ~ 90%",
              value: Math.floor(rankData.monthInfo.top90Avg),
            });
            break;
          case 10:
            rankData.monthInfo.rankList.push({
              key: index,
              keyNm: "그 외",
              value: Math.floor(rankData.monthInfo.topOthAvg),
            });
            break;
        }
      });

      rankData.monthInfo.self_rankIdx = Math.ceil(
        rankData.monthInfo.percentileRank / 10
      );

      set({ rankData: rankData });
    } catch (error) {
      set({ error: error.message });
    }
  },
}));

export default useSaleCompareStore;
