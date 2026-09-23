# Hemidi – Junior Animated Web Developer Entry Exam

Đây là bài làm của mình cho vòng test Junior Animated Web Developer ở Hemidi. Mình dựng lại landing page "Sark" từ Figma bằng Next.js, rồi thêm chú robot 3D chạy bằng Three.js và GSAP ScrollTrigger. Robot đi theo người xem suốt trang.

- Live demo: https://tvinhthanh-interview.vercel.app/
- Source: https://github.com/tvinhthanh/Tvinhthanh-Interview-Animated-Web
- Stack: Next.js 16 (App Router, trang tĩnh), Three.js 0.180, GSAP 3.13

## Chạy thử ở máy

```bash
npm install
npm run dev              # http://localhost:3000
npm run build && npm start
```

Nếu deploy ở chỗ khác Vercel thì đặt thêm `NEXT_PUBLIC_SITE_URL` là domain thật để canonical, Open Graph và sitemap trỏ đúng. Trên Vercel không cần, code tự lấy domain production.

## Model 3D

Model lấy từ Sketchfab: [Friendly Sci-Fi Robot with Animations](https://sketchfab.com/3d-models/friendly-sci-fi-robot-with-animations-b83ac12ac3f14119a0988532d3613dac). Tác giả và giấy phép xem ở trang gốc.

File tải về nặng 5,4 MB, trong đó riêng texture PNG đã chiếm 3,8 MB, quá nặng cho một landing page. Mình nén lại bằng glTF-Transform:

```bash
npx @gltf-transform/cli optimize robot.glb public/models/friendly-robot.glb \
  --compress meshopt --texture-compress webp --texture-size 1024
```

Kết quả còn 574 KB (giảm khoảng 89%). Texture thành WebP 1024px, 133 KB. Robot trên trang chỉ cao cỡ 500px nên 1024px vẫn nét. Mesh nén bằng meshopt, và `MeshoptDecoder` có sẵn trong three nên không phải kèm thêm file wasm nào. Cả 3 clip animation vẫn giữ nguyên.

## Robot chuyển động thế nào

Toàn bộ nằm trong [`lib/robotScene.js`](lib/robotScene.js).

Có một chỗ phải nói trước: đề bảo phát clip "Idle" ở Hero, nhưng model này **không có** clip Idle. Nó chỉ có `Look_Wave`, `Free_Fall` và `Sitting`. Nên ở Hero mình cho chạy `Look_Wave` lặp lại, cộng thêm một nhịp nhấp nhô nhẹ bằng code cho giống đang "thở". Thân robot xoay theo con trỏ chuột, có làm mượt để không bị giật.

Lúc đầu mình dịch cả khung canvas bằng CSS với số pixel cố định. Làm vậy đổi kích thước màn hình là robot lệch khỏi bố cục. Nên mình làm lại theo cách khác:

- Canvas phủ toàn màn hình.
- Trong trang đặt sẵn vài "điểm neo" (`data-robot-anchor`) đúng chỗ robot cần đứng.
- Mỗi frame, code đo vị trí của điểm neo trên màn hình, đổi sang tọa độ 3D, rồi GSAP `quickTo` kéo position, scale và rotation của robot tới đó.

Nhờ vậy robot luôn khớp layout, kể cả trên tablet hay điện thoại.

| Section | Robot ở đâu | Clip |
|---|---|---|
| Hero | Trong vòm bên phải, quay về phía tiêu đề | `Look_Wave` |
| Features | Cạnh tiêu đề | `Free_Fall` |
| About | Ngồi trong vòm video | `Sitting` |
| Team | Trong ô tròn của Leslie Alexander, vẫy tay như một thành viên | `Look_Wave` |

Giữa hai section, robot "rơi" từ điểm neo này sang điểm neo kế tiếp bằng clip `Free_Fall`. Clip được đổi bằng ScrollTrigger và chuyển mượt qua fade 0,45 giây. Nếu máy bật "giảm chuyển động" (`prefers-reduced-motion`), robot chỉ đứng yên.

## Tốc độ tải

Đề yêu cầu PageSpeed Desktop trên 90. Đo bằng Lighthouse trên bản Vercel:

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 99 | 100 | 100 | 100 |
| Mobile | 96 | 100 | 100 | 100 |

Những việc mình làm để đạt được:

- **Three.js không nằm trong JS lúc đầu.** Nó chỉ được tải khi trang đã hiện xong, font tiêu đề đã vào, và robot đã lọt vào màn hình. Trên máy tính robot có sẵn ở màn hình đầu nên vẫn tải ngay. Trên điện thoại robot nằm dưới, nên chỉ tải khi người dùng bắt đầu cuộn.
- **Máy không có GPU thì hiện ảnh tĩnh.** Chỗ này mình vấp khi chạy PageSpeed thật: desktop chỉ được 69. Lý do là máy của Google không có GPU, nên WebGL phải vẽ bằng CPU và mỗi frame thành một task dài. Giờ trước khi tải Three.js, trang thử tạo WebGL với `failIfMajorPerformanceCaveat`. Nếu máy chỉ vẽ được bằng phần mềm, trang hiện ảnh robot 18 KB thay cho bản 3D. Người dùng có GPU vẫn thấy robot 3D bình thường.
- **Robot ra khỏi màn hình thì ngừng render**, và độ phân giải canvas giới hạn ở 1.5x.
- **Font tự host qua `next/font`** (Inter và Source Serif Pro), có font dự phòng cùng kích thước nên đổi font không làm trang nhảy (CLS = 0).
- **Tiêu đề hero hiện ngay, không fade-in**, vì đó là phần tử LCP.
- **Ảnh qua `next/image`**, các animation chỉ dùng `transform` và `opacity`.
- **SEO cơ bản đủ cả:** metadata, ảnh Open Graph, canonical, sitemap, robots.txt, JSON-LD.

Trong lúc model đang tải, chỗ robot sẽ đứng có một chấm sáng xanh nhấp nháy, tải xong thì robot hiện dần lên.

## Cấu trúc thư mục

```
app/            layout, trang chính, CSS, font, sitemap/robots/OG image
components/     Experience.jsx: canvas, lazy-load scene, menu mobile
lib/            robotScene.js: scene Three.js, điểm neo, GSAP
public/models/  friendly-robot.glb (đã nén) và ảnh robot dự phòng
```

## Nếu có thêm thời gian

- Form Subscribe ở footer mới chỉ hiện lời cảm ơn, chưa nối backend.
- Các link Blog, Pages, Login trỏ tới các section trong trang vì bản thiết kế chỉ có một trang.
- Muốn có clip Idle thật thì phải tự làm thêm trong Blender, hoặc tìm model khác có sẵn clip Idle.
