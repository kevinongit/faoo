import { PuffLoader } from "react-spinners";

export default function Loading({ loading = true, size = 100, color = "red", text = "" }) {
  if (!loading) return null; // 로딩이 false면 표시 안함

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50 text-white">
      <PuffLoader color={color} size={size} />
      {text && <p className="mt-4 text-lg font-semibold">{text}</p>}
    </div>
  );
}