# Hemidi — Junior Animated Web Developer Entry Exam

Landing page "Sark" (Figma → Next.js) với mascot robot 3D điều khiển bằng Three.js + GSAP ScrollTrigger.

- **Live demo:** https://tvinhthanh-interview.vercel.app/
- **Source:** https://github.com/tvinhthanh/Tvinhthanh-Interview-Animated-Web
- **Stack:** Next.js 16 (App Router, trang tĩnh prerender), Three.js 0.180, GSAP 3.13 + ScrollTrigger

## Chạy local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Biến môi trường (tuỳ chọn): `NEXT_PUBLIC_SITE_URL` — domain thật, dùng cho canonical / Open Graph / sitemap.

## 1. Asset 3D

Nguồn: [Friendly Sci-Fi Robot with Animations](https://sketchfab.com/3d-models/friendly-sci-fi-robot-with-animations-b83ac12ac3f14119a0988532d3613dac) (Sketchfab, tác giả và giấy phép xem tại trang gốc).

Tối ưu bằng [glTF-Transform](https://gltf-transform.dev/):

```bash
npx @gltf-transform/cli optimize robot.glb public/models/friendly-robot.glb \
  --compress meshopt --texture-compress webp --texture-size 1024
```

| | Gốc | Sau tối ưu |
|---|---|---|
| File `.glb` | 5.41 MB | **574 KB** (−89%) |
| Texture | PNG 3.8 MB | WebP 1024px, 133 KB |
| Mesh | không nén | meshopt + quantization |

Giữ nguyên đủ 3 clip: `Look_Wave`, `Free_Fall`, `Sitting`. Loader dùng `MeshoptDecoder` (không cần file wasm/draco riêng).

## 2. Điều khiển animation

Code: [`lib/robotScene.js`](lib/robotScene.js).

**Về clip "Idle":** model này **không có** clip Idle — chỉ có `Look_Wave`, `Free_Fall`, `Sitting`. Trạng thái mặc định ở Hero dùng `Look_Wave` (loop) kết hợp nhịp "thở" lên xuống nhẹ bằng code để đóng vai trò idle.

**Hero:** robot phát `Look_Wave` lặp, thân robot xoay theo con trỏ chuột (lerp mượt, yaw + pitch).

**Cuộn trang:** canvas phủ toàn viewport; robot được đặt vào các "điểm neo" nằm ngay trong layout (`data-robot-anchor`). Vị trí/kích thước của phần tử neo trên màn hình được quy đổi sang toạ độ world (camera perspective cố định), rồi GSAP `quickTo` đưa `position` / `scale` / `rotation` của robot tới đó — nên robot luôn khớp bố cục ở mọi kích thước màn hình, không dùng số pixel cứng.

| Section | Điểm neo | Clip | Hướng |
|---|---|---|---|
| Hero | vòm bên phải | `Look_Wave` | quay về phía tiêu đề |
| Features | cạnh tiêu đề | `Free_Fall` | quay về nội dung |
| About (video) | trong vòm video | `Sitting` | quay về đoạn văn |
| Team | ô trống "Open team position" | `Look_Wave` | nhìn thẳng — robot là "thành viên" |

Giữa hai điểm neo robot "rơi" sang điểm tiếp theo (clip `Free_Fall`). Clip được đổi bằng `ScrollTrigger` cho từng section, chuyển mượt bằng fadeIn/fadeOut 0.45s.

`prefers-reduced-motion`: robot đứng yên ở tư thế đầu tiên, không đổi clip, không có hiệu ứng reveal.

## 3. Hiệu năng & SEO

Lighthouse 12 trên bản deploy Vercel (desktop preset / mobile throttling mặc định, 2–3 lần đo):

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | **96–99** | 100 | 100 | 100 |
| Mobile | 94–98 | 100 | 100 | 100 |

Những gì đã làm:

- **Three.js + GSAP tách khỏi bundle đầu** — `import()` động sau sự kiện `load`, sau khi web font đã swap (tiêu đề hero là LCP), và chỉ khi một điểm neo của robot hiện ≥35% trên màn hình (`IntersectionObserver`) + `requestIdleCallback`. Desktop/tablet: robot nằm ngay màn hình đầu nên tải ngay; điện thoại: robot hero nằm phần lớn dưới fold nên chỉ tải khi người dùng bắt đầu cuộn.
- **Không có GPU → ảnh tĩnh:** trước khi tải three.js, trang thử tạo WebGL context với `failIfMajorPerformanceCaveat`. Máy chỉ có WebGL phần mềm (SwiftShader/llvmpipe — kể cả máy chủ đo PageSpeed) sẽ hiển thị ảnh poster 18 KB thay vì render 3D bằng CPU (trước đó PSI Desktop chỉ đạt 69 vì TBT ~29 s).
- **Model 574 KB** (xem trên), `renderer.compile()` trước khi hiện để tránh giật khung hình đầu.
- **Render loop tự dừng** khi robot đã ra khỏi màn hình; pixel ratio giới hạn 1.5.
- **Font tự host** qua `next/font` (Inter + Source Serif Pro 600, subset latin), có preload và fallback khớp metric → **CLS = 0**.
- Tiêu đề hero không bị fade-in (giữ LCP sớm); các animation reveal chỉ dùng `transform`/`opacity`.
- Ảnh qua `next/image` (AVIF/WebP, đúng kích thước, lazy-load dưới fold).
- SEO: metadata, Open Graph image, canonical, `sitemap.xml`, `robots.txt`, JSON-LD `ProfessionalService`, HTML ngữ nghĩa, skip link.

Loading: trong lúc tải model, vị trí robot hiển thị một chấm sáng nhấp nháy; khi xong robot fade-in.

## Cấu trúc

```
app/            layout, page, CSS, font, sitemap/robots/OG image
components/     Experience.jsx — canvas + lazy-load scene
lib/            robotScene.js — Three.js scene, neo layout, GSAP
public/models/  friendly-robot.glb (đã tối ưu)
```
