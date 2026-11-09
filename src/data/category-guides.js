export const CATEGORY_EDITORIAL_GUIDES = {
  'AI': {
    title: 'Danh mục Công cụ Trí tuệ Nhân tạo (AI) & Tự động hóa',
    subtitle: 'Tổng hợp và đánh giá các nền tảng AI tạo sinh, trợ lý ngôn ngữ, xử lý hình ảnh, âm thanh và AI Agent phục vụ công việc thực tế.',
    intro: 'Các công cụ AI hiện nay đã vượt qua giai đoạn thử nghiệm đơn thuần để trở thành trợ lý trực tiếp trong việc viết lách, lập trình, thiết kế và nghiên cứu dữ liệu. Tuy nhiên, mỗi mô hình AI lại có thế mạnh riêng: có công cụ mạnh về suy luận logic và xử lý tài liệu dài, có công cụ lại chuyên biệt cho việc tạo video, giọng nói hoặc tự động hóa quy trình đa nền tảng.',
    criteria: [
      'Khả năng xử lý tiếng Việt và độ chính xác thực tế: Ưu tiên các công cụ hiểu đúng ngữ cảnh chuyên ngành và ít xảy ra hiện tượng bịa đặt thông tin (hallucination).',
      'Cơ chế tính phí theo Credit hay Thuê bao tháng: Kiểm tra kỹ số lượt tạo (credits) trong gói miễn phí/dùng thử để ước tính đúng chi phí vận hành hàng tháng.',
      'Chính sách bảo mật dữ liệu đầu vào: Xác minh xem nhà cung cấp có sử dụng dữ liệu tải lên của bạn để huấn luyện mô hình công khai hay không.'
    ],
    workflowTip: 'Thay vì đăng ký cùng lúc nhiều công cụ AI chồng chéo, hãy kết hợp 1 mô hình ngôn ngữ lớn (LLM) làm trung tâm xử lý ý tưởng và 1–2 công cụ AI chuyên biệt cho đầu ra cuối cùng (thiết kế, video hoặc code).'
  },
  'Thiết kế': {
    title: 'Danh mục Công cụ Thiết kế Đồ họa, UI/UX & Tài nguyên Sáng tạo',
    subtitle: 'Tuyển tập phần mềm thiết kế giao diện, thư viện icon, bảng màu, mockup 3D, font chữ và trình chỉnh sửa ảnh dành cho Designer và Creator.',
    intro: 'Dù bạn là Product Designer chuyên nghiệp làm việc trên Figma mỗi ngày hay là người làm nội dung cần thiết kế ấn phẩm truyền thông nhanh chóng, việc sở hữu bộ công cụ và tài nguyên thiết kế chuẩn xác sẽ giúp tiết kiệm hàng chục giờ làm việc mỗi tuần.',
    criteria: [
      'Định dạng xuất file và khả năng chỉnh sửa: Kiểm tra xem công cụ có cho phép xuất file vector (SVG, PDF), giữ nguyên cấu trúc layer hoặc copy trực tiếp sang Figma hay không.',
      'Giấy phép bản quyền thương mại (License): Phân biệt rõ tài nguyên miễn phí cho mục đích cá nhân (Personal Use) và tài nguyên cho phép sử dụng trong dự án thương mại của khách hàng.',
      'Tính nhất quán của hệ thống thiết kế (Design System): Chọn các thư viện icon và minh họa có cùng độ dày nét (stroke weight) và phong cách thị giác đồng bộ.'
    ],
    workflowTip: 'Luôn kiểm tra file xuất ở kích thước thực tế và độ tương phản màu sắc trên cả nền sáng (Light Mode) lẫn nền tối (Dark Mode) trước khi bàn giao cho đội lập trình.'
  },
  'Lập trình': {
    title: 'Danh mục Công cụ Lập trình, DevTools & Hạ tầng Kỹ thuật',
    subtitle: 'Các thư viện UI, công cụ hỗ trợ viết code, kiểm thử API, quản lý cơ sở dữ liệu, bảo mật và tối ưu hiệu năng cho Developer.',
    intro: 'Trong phát triển phần mềm hiện đại, việc lựa chọn đúng thư viện hoặc công cụ DevTools giúp đội ngũ kỹ thuật giảm thiểu nợ kỹ thuật (technical debt), tăng tốc độ dựng prototype và đảm bảo tính ổn định khi vận hành trên môi trường production.',
    criteria: [
      'Hiệu năng và dung lượng gói (Bundle Size): Với các thư viện frontend/animation, ưu tiên giải pháp nhẹ, hỗ trợ tree-shaking và không làm chậm tốc độ tải trang.',
      'Chất lượng tài liệu kỹ thuật (Documentation) & Cộng đồng: Công cụ tốt cần có tài liệu rõ ràng, ví dụ mẫu đầy đủ và lịch sử cập nhật bản vá bảo mật đều đặn.',
      'Khả năng thoát phụ thuộc (Vendor Lock-in): Đánh giá mức độ dễ dàng khi cần di chuyển dữ liệu hoặc thay thế thư viện trong tương lai.'
    ],
    workflowTip: 'Hãy luôn thử nghiệm thư viện hoặc công cụ mới trên một nhánh (branch) độc lập và đo lường chỉ số Core Web Vitals trước khi tích hợp vào nhánh chính của dự án.'
  },
  'Năng suất': {
    title: 'Danh mục Công cụ Năng suất, Ghi chú (PKM) & Quản lý Công việc',
    subtitle: 'Giải pháp tổ chức kiến thức cá nhân, ghi chú thông minh, quản lý thời gian, tự động hóa tác vụ và cộng tác đội nhóm.',
    intro: 'Công cụ năng suất không chỉ là nơi lưu trữ danh sách việc cần làm (To-do list), mà còn là "bộ não thứ hai" (Second Brain) giúp bạn thu thập, liên kết ý tưởng và biến thông tin rời rạc thành kết quả công việc cụ thể.',
    criteria: [
      'Tốc độ ghi nhận thông tin (Frictionless Capture): Ứng dụng cần khởi động nhanh, hỗ trợ phím tắt hoặc lưu nhanh từ trình duyệt/điện thoại mà không làm đứt mạch suy nghĩ.',
      'Khả năng xuất và sở hữu dữ liệu: Ưu tiên các nền tảng hỗ trợ xuất toàn bộ ghi chú sang định dạng chuẩn như Markdown (.md), CSV hoặc JSON.',
      'Đồng bộ đa thiết bị và chế độ ngoại tuyến (Offline Mode): Đảm bảo bạn vẫn truy cập được tài liệu quan trọng ngay cả khi kết nối mạng không ổn định.'
    ],
    workflowTip: 'Đừng dành quá nhiều thời gian trang trí giao diện quản lý công việc; hãy bắt đầu với cấu trúc đơn giản nhất và chỉ thêm quy tắc phân loại khi dữ liệu thực sự lớn.'
  },
  'Marketing': {
    title: 'Danh mục Công cụ Marketing, Tăng trưởng (Growth) & Sáng tạo Nội dung',
    subtitle: 'Nền tảng hỗ trợ nghiên cứu thị trường, quản lý mạng xã hội, email marketing, tối ưu chuyển đổi và phân phối nội dung đa kênh.',
    intro: 'Hoạt động Marketing hiện đại đòi hỏi sự kết hợp chặt chẽ giữa sáng tạo nội dung và phân tích dữ liệu. Các công cụ trong danh mục này giúp Marketer, Solo Founder và đội ngũ tăng trưởng tự động hóa khâu phân phối để tập trung vào thông điệp cốt lõi.',
    criteria: [
      'Khả năng kết nối đa nền tảng chính thống: Ưu tiên các công cụ tích hợp qua API chính thức của các mạng xã hội để đảm bảo an toàn cho tài khoản thương hiệu.',
      'Đo lường hiệu quả chuyển đổi thực tế: Đánh giá công cụ dựa trên khả năng theo dõi lưu lượng truy cập, tỷ lệ nhấp (CTR) và doanh thu thay vì chỉ nhìn vào các chỉ số bề nổi.',
      'Tính linh hoạt khi cá nhân hóa nội dung: Công cụ hỗ trợ đăng đa kênh cần cho phép tinh chỉnh định dạng riêng cho từng nền tảng (TikTok, LinkedIn, Facebook, YouTube).'
    ],
    workflowTip: 'Sử dụng công cụ để tự động hóa việc lên lịch và tổng hợp báo cáo, nhưng hãy luôn giữ bước biên tập cuối cùng bởi con người để đảm bảo giọng văn thương hiệu tự nhiên.'
  },
  'Repo GitHub': {
    title: 'Danh mục Kho Mã nguồn mở (Repo GitHub) & Giải pháp Self-Host',
    subtitle: 'Tuyển chọn các dự án mã nguồn mở chất lượng cao trên GitHub: từ ứng dụng thay thế SaaS trả phí đến thư viện và tài nguyên học tập.',
    intro: 'Các dự án mã nguồn mở trên GitHub mang lại sự minh bạch tuyệt đối, khả năng tự triển khai trên máy chủ riêng (Self-host) để bảo mật dữ liệu 100%, đồng thời là nguồn tài nguyên quý giá để học hỏi kiến trúc phần mềm thực chiến.',
    criteria: [
      'Giấy phép mã nguồn mở (License): Kiểm tra kỹ dự án dùng giấy phép MIT, Apache 2.0 (cho phép tùy biến thương mại rộng rãi) hay GPL/AGPL (có điều kiện ràng buộc mã nguồn).',
      'Sức khỏe của dự án (Project Health): Xem xét thời점 commit gần nhất, tốc độ phản hồi Issue/Pull Request và hướng dẫn cài đặt qua Docker Compose.',
      'Chi phí vận hành hạ tầng: Dù phần mềm miễn phí, việc tự host trên VPS/Cloud vẫn tiêu tốn tài nguyên máy chủ và công sức bảo trì định kỳ.'
    ],
    workflowTip: 'Trước khi triển khai một Repo GitHub cho cả công ty sử dụng, hãy dựng bản thử nghiệm qua Docker trên môi trường local và kiểm tra quy trình sao lưu (backup) cơ sở dữ liệu.'
  },
  'Plugin Figma': {
    title: 'Danh mục Plugin Figma Tối ưu Quy trình Thiết kế UI/UX',
    subtitle: 'Các tiện ích mở rộng chạy trực tiếp trong Figma giúp tự động hóa thao tác lặp lại, tạo dữ liệu mẫu, kiểm tra độ tương phản và bàn giao thiết kế.',
    intro: 'Khi làm việc với các dự án UI/UX quy mô lớn, những thao tác thủ công như đổi tên hàng trăm layer, chèn dữ liệu giả lập hay xuất tài nguyên có thể ngốn rất nhiều thời gian. Plugin Figma chính là đòn bẩy giúp Designer tăng tốc gấp nhiều lần.',
    criteria: [
      'Tác động lên cấu trúc Layer & Auto Layout: Chọn các plugin giữ nguyên hệ thống đặt tên, biến (Variables) và Auto Layout của file thiết kế.',
      'Hiệu năng trên file lớn: Ưu tiên các plugin phản hồi nhanh, không gây treo tab Figma khi xử lý các trang có hàng trăm component.',
      'Quyền riêng tư của thiết kế: Lưu ý khi sử dụng các plugin gửi hình ảnh frame ra máy chủ bên ngoài nếu dự án của bạn có cam kết bảo mật (NDA).'
    ],
    workflowTip: 'Hãy lập một danh sách 5–7 Plugin Figma chuẩn dùng chung cho cả nhóm thiết kế để đảm bảo mọi thành viên tạo ra cấu trúc file đồng nhất.'
  },
  'Extension': {
    title: 'Danh mục Tiện ích Mở rộng Trình duyệt (Browser Extensions)',
    subtitle: 'Các công cụ tích hợp trực tiếp vào Chrome, Edge, Brave và Firefox giúp tra cứu nhanh, chụp màn hình, kiểm tra kỹ thuật web và tăng năng suất.',
    intro: 'Tiện ích mở rộng trình duyệt giúp đưa các tính năng hữu ích nhất vào ngay trang web bạn đang làm việc mà không cần mở thêm phần mềm rời. Từ việc kiểm tra font chữ, bắt mã màu cho đến tóm tắt bài viết dài, mọi thứ diễn ra chỉ với một cú nhấp chuột.',
    criteria: [
      'Quyền truy cập trình duyệt (Permissions): Chỉ cài đặt các extension yêu cầu quyền hạn hợp lý với chức năng của nó.',
      'Mức tiêu thụ RAM và CPU: Tránh cài quá nhiều tiện ích chạy ngầm trên mọi tab vì có thể làm chậm trình duyệt đáng kể.',
      'Uy tín nhà phát triển và tần suất cập nhật: Ưu tiên các tiện ích tương thích chuẩn Manifest V3 mới nhất và có thông tin nhà phát triển minh bạch.'
    ],
    workflowTip: 'Trong cài đặt quản lý Extension của trình duyệt, hãy chuyển chế độ truy cập trang web sang "Khi bạn nhấp vào tiện ích" (On Click) đối với các công cụ không cần chạy liên tục.'
  },
  'Video': {
    title: 'Danh mục Công cụ Sản xuất, Chỉnh sửa Video & Âm thanh',
    subtitle: 'Giải pháp dựng video ngắn, tạo motion graphics, tách nền, lồng tiếng và tạo phụ đề tự động cho nhà sáng tạo nội dung và đội ngũ truyền thông.',
    intro: 'Nội dung video đang chiếm tỷ trọng lớn nhất trên mọi nền tảng số, nhưng quy trình dựng phim truyền thống thường đòi hỏi thiết bị cấu hình cao và kỹ năng phức tạp. Các công cụ video thế hệ mới giúp rút ngắn quy trình từ kịch bản đến thành phẩm chỉ trong vài chục phút.',
    criteria: [
      'Chất lượng xuất file (Export Resolution) & Watermark: Kiểm tra ngay từ đầu xem bản miễn phí có cho phép xuất video Full HD 1080p không dính logo mờ hay không.',
      'Độ chính xác của phụ đề và giọng đọc tiếng Việt: Với các công cụ tạo phụ đề tự động hoặc Text-to-Speech, hãy thử nghiệm trực tiếp với đoạn âm thanh tiếng Việt thực tế.',
      'Bản quyền tài nguyên âm nhạc và footage đi kèm: Đảm bảo kho nhạc nền của công cụ không bị đánh bản quyền (Content ID) khi đăng lên YouTube hoặc Facebook.'
    ],
    workflowTip: 'Luôn xuất thử một đoạn video ngắn 10 giây ở cấu hình cuối cùng để kiểm tra màu sắc, tỷ lệ khung hình và độ đồng bộ âm thanh trước khi render toàn bộ dự án dài.'
  },
  'SEO & Analytics': {
    title: 'Danh mục Công cụ SEO, Nghiên cứu Từ khóa & Phân tích Website',
    subtitle: 'Bộ công cụ hỗ trợ kiểm tra kỹ thuật SEO, phân tích từ khóa, theo dõi thứ hạng, tối ưu nội dung và đo lường hành vi người dùng trên website.',
    intro: 'Để xây dựng nguồn lưu lượng truy cập tự nhiên (Organic Traffic) bền vững, người làm website cần dựa trên dữ liệu thực tế thay vì phỏng đoán. Các công cụ SEO & Analytics giúp bạn phát hiện lỗi kỹ thuật, tìm ra nhu cầu tìm kiếm thực sự của độc giả và đo lường hiệu quả nội dung.',
    criteria: [
      'Độ phủ dữ liệu tại thị trường mục tiêu: Khi nghiên cứu từ khóa tiếng Việt, cần chọn công cụ hỗ trợ phân tách dữ liệu theo quốc gia (Vietnam) và ngôn ngữ tiếng Việt.',
      'Tác động đến tốc độ tải trang (với mã theo dõi Analytics): Ưu tiên các giải pháp đo lường có script siêu nhẹ và tuân thủ quy định bảo mật quyền riêng tư.',
      'Khả năng kết hợp với Google Search Console: Công cụ tốt sẽ bổ trợ cho dữ liệu chính chủ từ Google thay vì thay thế hoàn toàn.'
    ],
    workflowTip: 'Đừng chỉ chạy theo các từ khóa có lượng tìm kiếm khổng lồ; hãy dùng công cụ để tìm các từ khóa ngách giải quyết đúng vấn đề cụ thể của người đọc.'
  },
  'Khác': {
    title: 'Danh mục Công cụ Tiện ích Chuyên biệt & Đa lĩnh vực',
    subtitle: 'Tập hợp các tiện ích trực tuyến độc đáo phục vụ biên tập văn bản, kiểm tra dữ liệu, chuyển đổi định dạng và giải quyết các tác vụ chuyên biệt.',
    intro: 'Bên cạnh các nhóm phần mềm lớn, có rất nhiều công cụ nhỏ gọn được thiết kế theo triết lý "làm thật tốt một việc duy nhất". Danh mục này quy tụ những tiện ích thiết thực giúp bạn xử lý nhanh các bài toán phát sinh hàng ngày.',
    criteria: [
      'Sự tiện lợi và tốc độ phản hồi: Có thể sử dụng ngay trên trình duyệt mà không bắt buộc cài đặt phần mềm nặng nề hay đăng ký tài khoản phức tạp.',
      'Tính minh bạch về giới hạn sử dụng: Nắm rõ giới hạn kích thước tệp tin hoặc số lượt xử lý mỗi ngày.',
      'An toàn khi xử lý tài liệu trực tuyến: Ưu tiên các công cụ xử lý trực tiếp trên trình duyệt (client-side) khi làm việc với văn bản hoặc tệp tin nội bộ.'
    ],
    workflowTip: 'Hãy đánh dấu (Bookmark) những tiện ích chuyên biệt mà bạn thấy hữu ích vào một thư mục riêng trên trình duyệt để mở ngay khi phát sinh nhu cầu.'
  }
};

export function getCategoryGuide(category = 'Khác') {
  return CATEGORY_EDITORIAL_GUIDES[category] || CATEGORY_EDITORIAL_GUIDES['Khác'];
}
