import { removeVietnameseTones } from './utils.js';

export function slugifyText(text = '') {
  return removeVietnameseTones(String(text || ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getToolSlug(tool) {
  if (!tool) return '';
  const base = slugifyText(tool.name) || 'cong-cu';
  return `${base}-${tool.id}`;
}

export function findToolBySlug(tools = [], slugParam = '') {
  if (!slugParam || !Array.isArray(tools) || tools.length === 0) return null;
  const clean = String(slugParam).toLowerCase().trim();

  // 1. Exact match on getToolSlug(tool)
  const exact = tools.find((t) => getToolSlug(t) === clean);
  if (exact) return exact;

  // 2. Match trailing -<id>
  const idMatch = clean.match(/-(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const byId = tools.find((t) => Number(t.id) === id);
    if (byId) return byId;
  }

  // 3. Match pure numeric ID
  if (/^\d+$/.test(clean)) {
    const byNumeric = tools.find((t) => Number(t.id) === Number(clean));
    if (byNumeric) return byNumeric;
  }

  // 4. Match by base name slug
  return tools.find((t) => slugifyText(t.name) === clean) || null;
}

export function getPricingLabelVi(pricing) {
  if (pricing === 'free') return 'Miễn phí';
  if (pricing === 'paid') return 'Trả phí';
  return 'Có gói dùng thử / Freemium';
}

const CATEGORY_WORKFLOW_CONTEXT = {
  'AI': {
    domainName: 'Trí tuệ nhân tạo (AI) & Tự động hóa thông minh',
    typicalInput: 'câu lệnh (prompt), tài liệu thô, dữ liệu văn bản hoặc yêu cầu sáng tạo',
    typicalOutput: 'nội dung hoàn chỉnh, bản tóm tắt, mã nguồn hoặc tài nguyên đa phương tiện đã qua xử lý',
    evaluationFocus: 'độ chính xác của kết quả đầu ra, khả năng hiểu ngữ cảnh tiếng Việt, tốc độ phản hồi và chính sách bảo mật dữ liệu đầu vào',
    step2Action: 'Nhập yêu cầu thử nghiệm (prompt) với ngữ cảnh rõ ràng: nêu rõ vai trò, định dạng đầu ra mong muốn và các ràng buộc cụ thể thay vì chỉ dùng câu lệnh ngắn.',
    step3Action: 'Kiểm chứng chéo kết quả (fact-check), tinh chỉnh lại các đoạn chưa sát ý và xuất kết quả sang định dạng phục vụ công việc thực tế.',
    caveat: 'Kết quả do mô hình AI sinh ra có thể xuất hiện sai lệch thông tin (hallucination) nếu thiếu dữ liệu đầu vào cụ thể; người dùng luôn cần bước biên tập và kiểm chứng cuối cùng.',
  },
  'Thiết kế': {
    domainName: 'Thiết kế đồ họa, UI/UX & Sáng tạo thị giác',
    typicalInput: 'ý tưởng bố cục, bảng màu thương hiệu (brand guidelines), wireframe hoặc tài nguyên hình ảnh gốc',
    typicalOutput: 'file thiết kế chất lượng cao, giao diện UI, bộ icon/minh họa hoặc ấn phẩm truyền thông sẵn sàng xuất bản',
    evaluationFocus: 'chất lượng file xuất (vector SVG, PNG độ phân giải cao, khả năng chỉnh sửa lớp/layer), bản quyền sử dụng thương mại và độ tương thích với phần mềm như Figma/Adobe',
    step2Action: 'Thử nghiệm tạo hoặc chỉnh sửa một mẫu thiết kế thực tế, kiểm tra khả năng tùy biến màu sắc, font chữ (đặc biệt là bộ gõ tiếng Việt) và bố cục.',
    step3Action: 'Xuất file ở định dạng đích (SVG, PNG, PDF hoặc mã CSS/Figma) và mở trực tiếp trong phần mềm thiết kế chính để kiểm tra độ sắc nét.',
    caveat: 'Cần kiểm tra kỹ giấy phép bản quyền (Commercial License) đối với các tài nguyên miễn phí trước khi đưa vào dự án thương mại của khách hàng.',
  },
  'Lập trình': {
    domainName: 'Phát triển phần mềm, DevTools & Hạ tầng kỹ thuật',
    typicalInput: 'mã nguồn dự án, yêu cầu kiến trúc hệ thống, API endpoint hoặc kịch bản kiểm thử',
    typicalOutput: 'module code sạch, giao diện component, tài liệu kỹ thuật hoặc quy trình CI/CD/triển khai tối ưu',
    evaluationFocus: 'độ ổn định khi chạy thực tế, kích thước gói (bundle size), tài liệu hướng dẫn (documentation), giấy phép mã nguồn và khả năng tích hợp vào stack hiện tại',
    step2Action: 'Cài đặt hoặc chạy thử trong một nhánh (branch) hoặc môi trường sandbox độc lập để đánh giá hiệu năng và tính tương thích với dự án.',
    step3Action: 'Kiểm tra xử lý lỗi (edge cases), bảo mật phụ thuộc (dependencies) và khả năng bảo trì lâu dài trước khi đưa vào môi trường production.',
    caveat: 'Tránh phụ thuộc hoàn toàn vào công cụ bên thứ ba cho các logic nghiệp vụ lõi nếu chưa có phương án sao lưu hoặc di chuyển dữ liệu (migration path).',
  },
  'Năng suất': {
    domainName: 'Quản lý công việc, Ghi chú (PKM) & Tối ưu hiệu suất cá nhân/nhóm',
    typicalInput: 'danh sách tác vụ hàng ngày, ghi chú cuộc họp, tài liệu nghiên cứu và lịch trình dự án',
    typicalOutput: 'hệ thống kiến thức có cấu trúc, bảng theo dõi tiến độ rõ ràng và quy trình làm việc tự động hóa',
    evaluationFocus: 'tốc độ ghi nhận thông tin nhanh, khả năng tìm kiếm/liên kết dữ liệu, đồng bộ đa thiết bị và khả năng xuất dữ liệu (Markdown, CSV, PDF) khi cần chuyển đổi',
    step2Action: 'Áp dụng công cụ cho một dự án nhỏ trong 3–5 ngày làm việc thực tế thay vì chuyển toàn bộ dữ liệu cũ sang ngay lập tức.',
    step3Action: 'Kiểm tra tính năng tìm kiếm, phân loại và thử xuất dữ liệu (Export) để đảm bảo bạn luôn làm chủ toàn bộ thông tin đã lưu.',
    caveat: 'Không nên dành quá nhiều thời gian thiết lập hệ thống phức tạp; công cụ năng suất tốt nhất là công cụ giảm thiểu thao tác thừa hàng ngày.',
  },
  'Marketing': {
    domainName: 'Tiếp thị số, Tăng trưởng (Growth) & Sáng tạo nội dung đa kênh',
    typicalInput: 'chân dung khách hàng mục tiêu, thông điệp chiến dịch, dữ liệu hiệu suất kênh hoặc kịch bản bán hàng',
    typicalOutput: 'chiến dịch nội dung hoàn chỉnh, trang đích chuyển đổi, chuỗi email/bài đăng đa nền tảng và báo cáo đo lường',
    evaluationFocus: 'khả năng cá nhân hóa thông điệp, mức độ tự động hóa đa kênh, báo cáo chỉ số chuyển đổi (ROI/CTR) và sự tuân thủ chính sách của các nền tảng mạng xã hội',
    step2Action: 'Thiết lập một chiến dịch thử nghiệm quy mô nhỏ (A/B test) trên 1–2 kênh chủ lực để đo lường mức độ tiết kiệm thời gian và hiệu quả tương tác.',
    step3Action: 'Theo dõi chỉ số chuyển đổi thực tế và tinh chỉnh nội dung để giữ giọng văn thương hiệu tự nhiên, tránh dấu hiệu rập khuôn.',
    caveat: 'Các công cụ tự động hóa marketing cần được kết hợp với chiến lược nội dung gốc và sự thấu hiểu khách hàng để tránh tạo ra thông điệp đại trà.',
  },
  'Repo GitHub': {
    domainName: 'Kho mã nguồn mở (Open Source) & Tài nguyên cộng đồng trên GitHub',
    typicalInput: 'nhu cầu tự triển khai (self-host), học tập kiến trúc mã nguồn hoặc tích hợp thư viện mở vào dự án',
    typicalOutput: 'hệ thống tự chủ hoàn toàn về dữ liệu, thư viện tích hợp miễn phí hoặc kiến thức kỹ thuật thực chiến',
    evaluationFocus: 'giấy phép mã nguồn mở (MIT, Apache 2.0, GPL...), tần suất cập nhật commit gần đây, số lượng issue đang mở và chất lượng hướng dẫn cài đặt (README)',
    step2Action: 'Đọc kỹ file README, kiểm tra mục License và chạy thử thông qua Docker hoặc môi trường local theo hướng dẫn của tác giả.',
    step3Action: 'Đánh giá chi phí vận hành máy chủ (nếu self-host) và khả năng tự xử lý lỗi kỹ thuật trước khi áp dụng cho quy mô đội nhóm.',
    caveat: 'Dự án mã nguồn mở thường không đi kèm cam kết hỗ trợ kỹ thuật 24/7 (SLA); bạn cần kiểm tra mức độ sôi nổi của cộng đồng trước khi sử dụng lâu dài.',
  },
  'Plugin Figma': {
    domainName: 'Tiện ích mở rộng trên Figma cho UI/UX & Product Designer',
    typicalInput: 'các frame thiết kế, hệ thống Design System, component hoặc dữ liệu văn bản/hình ảnh trong Figma',
    typicalOutput: 'file thiết kế được chuẩn hóa nhanh chóng, tự động hóa thao tác lặp lại và bàn giao (handoff) mượt mà cho Developer',
    evaluationFocus: 'tốc độ chạy trên file Figma lớn, khả năng giữ nguyên cấu trúc Auto Layout/Variables và chính sách giới hạn số lượt dùng miễn phí',
    step2Action: 'Mở một file Figma nháp (Draft), chạy plugin trên một vài frame mẫu để kiểm tra xem plugin có làm thay đổi cấu trúc layer ngoài ý muốn không.',
    step3Action: 'Lưu plugin vào danh sách yêu thích của nhóm thiết kế và thống nhất quy chuẩn đặt tên layer để phát huy tối đa hiệu quả tự động hóa.',
    caveat: 'Một số plugin xử lý dữ liệu qua máy chủ bên ngoài; hãy lưu ý bảo mật nếu bạn đang làm việc trên giao diện sản phẩm chưa công bố (NDA).',
  },
  'Extension': {
    domainName: 'Tiện ích mở rộng trình duyệt (Browser Extension) tăng tốc thao tác web',
    typicalInput: 'trang web đang truy cập, văn bản đang đọc, giao diện cần kiểm tra hoặc tác vụ lặp lại trên trình duyệt',
    typicalOutput: 'kết quả xử lý tức thì ngay trên tab trình duyệt mà không cần chuyển đổi qua lại giữa nhiều ứng dụng',
    evaluationFocus: 'quyền truy cập trình duyệt mà extension yêu cầu (Permissions), mức tiêu thụ bộ nhớ RAM và độ mượt khi hoạt động trên các trang web nặng',
    step2Action: 'Cài đặt tiện ích trên một hồ sơ trình duyệt (Browser Profile) phụ và kiểm tra các quyền truy cập dữ liệu trang web được yêu cầu.',
    step3Action: 'Ghim tiện ích nếu dùng hàng ngày hoặc thiết lập chỉ kích hoạt khi nhấp chuột ("On click") để tối ưu hiệu năng trình duyệt và bảo mật.',
    caveat: 'Chỉ nên duy trì các extension thực sự cần thiết và kiểm tra kỹ quyền đọc dữ liệu trang web để bảo vệ thông tin tài khoản quan trọng.',
  },
  'Video': {
    domainName: 'Sản xuất, Biên tập Video & Xử lý Âm thanh kỹ thuật số',
    typicalInput: 'kịch bản nội dung, footage quay thô, bản thu âm giọng nói hoặc câu lệnh tạo video bằng AI',
    typicalOutput: 'video hoàn chỉnh có phụ đề, hiệu ứng chuyển động (motion), lồng tiếng sắc nét sẵn sàng đăng tải lên YouTube, TikTok, Reels',
    evaluationFocus: 'độ phân giải video xuất ra (1080p/4K), có dính logo mờ (watermark) ở bản miễn phí hay không, tốc độ render và độ tự nhiên của âm thanh/chuyển động',
    step2Action: 'Thử dựng một đoạn video ngắn 15–30 giây từ đầu đến khâu xuất file cuối cùng để kiểm tra chất lượng hình ảnh và thời gian chờ render.',
    step3Action: 'Kiểm tra tỷ lệ khung hình (16:9 cho YouTube hoặc 9:16 cho Shorts/TikTok) cùng bản quyền nhạc nền/giọng đọc trước khi xuất bản.',
    caveat: 'Các gói miễn phí của công cụ video thường giới hạn thời lượng xuất file, độ phân giải hoặc gắn watermark; hãy kiểm tra kỹ trước khi đầu tư nhiều giờ biên tập.',
  },
  'SEO & Analytics': {
    domainName: 'Tối ưu hóa công cụ tìm kiếm (SEO) & Phân tích dữ liệu tăng trưởng',
    typicalInput: 'tên miền website, danh sách từ khóa mục tiêu, cấu trúc bài viết hoặc dữ liệu lưu lượng truy cập',
    typicalOutput: 'bộ từ khóa có lượng tìm kiếm thực, báo cáo audit kỹ thuật, gợi ý tối ưu on-page và biểu đồ hành vi người dùng',
    evaluationFocus: 'độ chính xác của dữ liệu tại thị trường Việt Nam, tần suất cập nhật chỉ mục (index), khả năng xuất báo cáo và chi phí theo số lượng dự án',
    step2Action: 'Nhập một URL hoặc nhóm từ khóa mà bạn đã nắm rõ số liệu thực tế từ Google Search Console để đối chiếu độ chính xác của công cụ.',
    step3Action: 'Ưu tiên xử lý các khuyến nghị có tác động lớn nhất đến trải nghiệm người dùng và chất lượng nội dung thay vì chạy theo điểm số máy móc.',
    caveat: 'Số liệu từ các công cụ SEO bên thứ ba luôn là con số ước tính tương đối; hãy kết hợp cùng dữ liệu gốc từ Google Search Console và Analytics.',
  },
  'Khác': {
    domainName: 'Tiện ích kỹ thuật số & Công cụ chuyên biệt phục vụ công việc',
    typicalInput: 'nhu cầu xử lý tác vụ chuyên biệt, dữ liệu văn bản, tệp tin hoặc quy trình làm việc hàng ngày',
    typicalOutput: 'kết quả xử lý nhanh gọn, chính xác giúp tiết kiệm thời gian thao tác thủ công',
    evaluationFocus: 'sự đơn giản trong giao diện sử dụng, tốc độ xử lý, chi phí hợp lý và khả năng giải quyết triệt để một bài toán cụ thể',
    step2Action: 'Trải nghiệm trực tiếp tính năng chính của công cụ với một tập dữ liệu mẫu nhỏ để đánh giá mức độ thuận tiện.',
    step3Action: 'Đánh giá xem công cụ có thực sự rút ngắn thời gian so với cách làm hiện tại của bạn trước khi đưa vào quy trình cố định.',
    caveat: 'Hãy ưu tiên những công cụ tập trung giải quyết tốt một nhu cầu thực tế thay vì có quá nhiều tính năng phụ ít khi dùng tới.',
  },
};

export function buildToolEditorialReview(tool, allTools = []) {
  const primaryCategory = tool.category || tool.categories?.[0] || 'Khác';
  const ctx = CATEGORY_WORKFLOW_CONTEXT[primaryCategory] || CATEGORY_WORKFLOW_CONTEXT['Khác'];
  const pricingLabel = getPricingLabelVi(tool.pricing);
  const categoriesJoined = (tool.categories?.length ? tool.categories : [primaryCategory]).join(', ');

  // 1. Overview paragraphs
  const overviewParagraphs = [
    tool.full_description || tool.short_description || `${tool.name} là một công cụ thuộc nhóm ${categoriesJoined}.`,
    `Trong hệ sinh thái các công cụ thuộc lĩnh vực ${ctx.domainName}, ${tool.name} được phân loại theo mô hình giá "${pricingLabel}". Công cụ này hướng tới việc giúp người dùng chuyển hóa ${ctx.typicalInput} thành ${ctx.typicalOutput} một cách có hệ thống, giảm bớt các bước thao tác thủ công lặp đi lặp lại.`,
    `Khi đánh giá ${tool.name} trên thực tế, người dùng tại Việt Nam nên tập trung kiểm tra ${ctx.evaluationFocus}. Việc hiểu rõ phạm vi tính năng ngay từ đầu sẽ giúp bạn tận dụng tối đa thế mạnh của công cụ và kết hợp nhịp nhàng với quy trình làm việc hiện có.`
  ];

  // 2. Pros list (combine DB features with contextual strengths)
  const dbFeatures = Array.isArray(tool.features) ? tool.features.filter(Boolean) : [];
  const prosList = [...dbFeatures];
  if (prosList.length < 3) {
    prosList.push(`Giao diện tập trung vào bài toán cốt lõi của nhóm ${categoriesJoined}, giúp làm quen nhanh mà không mất nhiều thời gian cấu hình.`);
    if (tool.pricing === 'free') {
      prosList.push('Cung cấp khả năng tiếp cận miễn phí, phù hợp cho cá nhân, sinh viên và nhóm nhỏ muốn thử nghiệm giải pháp mà không chịu áp lực chi phí ban đầu.');
    } else if (tool.pricing === 'freemium') {
      prosList.push('Cho phép trải nghiệm trước các tính năng cốt lõi thông qua gói dùng thử/Freemium trước khi quyết định đầu tư ngân sách.');
    } else {
      prosList.push('Mô hình sản phẩm thương mại chuyên sâu, tập trung vào chất lượng đầu ra và độ ổn định cho nhu cầu công việc chuyên nghiệp.');
    }
    prosList.push(`Hỗ trợ tối ưu hóa quy trình từ ${ctx.typicalInput} sang ${ctx.typicalOutput} với tốc độ xử lý nhanh.`);
  }

  // 3. Cons / Caveats list (realistic, constructive limitations)
  const consList = [];
  if (tool.pricing === 'free') {
    consList.push('Dù hiện tại được gắn nhãn Miễn phí, một số tính năng nâng cao, giới hạn băng thông hoặc chính sách giá của nhà cung cấp có thể thay đổi theo từng giai đoạn phát triển.');
  } else if (tool.pricing === 'freemium') {
    consList.push('Gói miễn phí hoặc dùng thử (Free Trial / Freemium) thường đi kèm giới hạn về số lượt sử dụng (credits), dung lượng lưu trữ hoặc tính năng xuất file nâng cao.');
  } else {
    consList.push('Là công cụ trả phí, người dùng cần cân nhắc kỹ tần suất sử dụng thực tế hàng tháng để đảm bảo chi phí bỏ ra tương xứng với giá trị mang lại (ROI).');
  }
  consList.push(ctx.caveat);
  consList.push('Giao diện hoặc tài liệu hướng dẫn gốc của nhà phát triển có thể sử dụng tiếng Anh làm ngôn ngữ chính; người mới nên thử nghiệm từng tính năng nhỏ trước.');

  // 4. Step-by-step How-to guide
  const howToSteps = [
    {
      step: 'Bước 1: Xác định rõ đầu vào và truy cập trang chính thức',
      detail: `Truy cập website chính thức của ${tool.name} (${tool.website_url || 'qua nút Truy cập Website'}). Chuẩn bị sẵn một mẫu ${ctx.typicalInput} thực tế (không chứa thông tin mật hoặc dữ liệu nhạy cảm trong lần thử đầu tiên).`
    },
    {
      step: 'Bước 2: Thiết lập và chạy thử tác vụ cốt lõi',
      detail: ctx.step2Action
    },
    {
      step: 'Bước 3: Đánh giá chất lượng đầu ra và khả năng xuất dữ liệu',
      detail: ctx.step3Action
    },
    {
      step: 'Bước 4: Đối chiếu giới hạn gói cước trước khi áp dụng dài hạn',
      detail: `Kiểm tra trang Pricing và Terms của ${tool.name} để nắm rõ giới hạn sử dụng (${pricingLabel}), quyền sở hữu thương mại đối với kết quả đầu ra và phương thức hủy/xuất dữ liệu khi cần.`
    }
  ];

  // 5. Target Audience & Use Cases
  const useCases = [
    {
      title: `Chuyên gia & Người làm việc trong mảng ${primaryCategory}`,
      description: `Những người thường xuyên phải xử lý ${ctx.typicalInput} và muốn rút ngắn thời gian tạo ra ${ctx.typicalOutput} với chất lượng ổn định.`
    },
    {
      title: 'Cá nhân, Freelancer & Đội ngũ tinh gọn (Lean Teams)',
      description: `Cần một giải pháp chuyên biệt như ${tool.name} để giải quyết nhanh điểm nghẽn trong quy trình mà không phải xây dựng hệ thống từ con số 0.`
    },
    {
      title: 'Khi nào bạn nên cân nhắc công cụ khác?',
      description: `Nếu quy trình hiện tại của bạn đòi hỏi tích hợp sâu vào hệ thống nội bộ (on-premise) hoặc yêu cầu các tính năng ngoài phạm vi của ${tool.name}, hãy tham khảo bảng so sánh các giải pháp thay thế bên dưới.`
    }
  ];

  // 6. Alternatives comparison in the same category
  const sameCategoryTools = allTools.filter(
    (other) =>
      other.id !== tool.id &&
      (other.category === primaryCategory || other.categories?.includes(primaryCategory))
  );
  const alternatives = sameCategoryTools.slice(0, 4).map((alt) => ({
    id: alt.id,
    name: alt.name,
    slug: getToolSlug(alt),
    pricing: alt.pricing,
    pricingLabel: getPricingLabelVi(alt.pricing),
    shortDescription: alt.short_description,
    highlight: alt.features?.[0] || alt.short_description,
  }));

  // 7. FAQs
  const faqs = [
    {
      question: `${tool.name} là gì và giải quyết vấn đề gì?`,
      answer: `${tool.name} là công cụ thuộc danh mục ${categoriesJoined}. ${tool.short_description || tool.full_description} Công cụ giúp người dùng tối ưu quá trình chuyển đổi từ ${ctx.typicalInput} thành ${ctx.typicalOutput}.`
    },
    {
      question: `${tool.name} có miễn phí không?`,
      answer: `Theo phân loại trên Toolchoice, ${tool.name} hiện thuộc nhóm "${pricingLabel}". ${
        tool.pricing === 'free'
          ? 'Bạn có thể bắt đầu sử dụng các tính năng chính mà không tốn phí, tuy nhiên hãy luôn kiểm tra trang chủ nhà cung cấp để cập nhật chính sách giới hạn mới nhất.'
          : tool.pricing === 'freemium'
          ? 'Nhà cung cấp có hỗ trợ gói miễn phí giới hạn hoặc dùng thử (Free Trial). Bạn nên trải nghiệm kỹ trên tác vụ mẫu trước khi quyết định nâng cấp lên gói trả phí.'
          : 'Đây là công cụ thương mại trả phí. Hãy kiểm tra kỹ chu kỳ thanh toán (tháng/năm) và chính sách hoàn tiền trên trang chủ trước khi đăng ký.'
      }`
    },
    {
      question: `Dùng ${tool.name} cần lưu ý gì về dữ liệu và bảo mật?`,
      answer: `Khi sử dụng ${tool.name} hoặc bất kỳ dịch vụ bên thứ ba nào, bạn không nên tải lên mật khẩu, thông tin định danh cá nhân (PII) hoặc tài liệu mật của doanh nghiệp khi chưa đọc kỹ Chính sách quyền riêng tư (Privacy Policy) trên website chính thức của nhà phát triển.`
    },
    {
      question: `Những công cụ nào có thể thay thế hoặc so sánh với ${tool.name}?`,
      answer: alternatives.length > 0
        ? `Trong cùng danh mục ${primaryCategory}, bạn có thể so sánh ${tool.name} với các công cụ như ${alternatives.map((a) => a.name).join(', ')}. Mỗi công cụ sẽ có thế mạnh riêng về mô hình giá và tính năng chi tiết.`
        : `Bạn có thể khám phá thêm các công cụ khác trong danh mục ${primaryCategory} trên Toolchoice để so sánh trực tiếp theo mô hình giá và tính năng.`
    }
  ];

  return {
    primaryCategory,
    categoriesJoined,
    pricingLabel,
    domainName: ctx.domainName,
    overviewParagraphs,
    prosList,
    consList,
    howToSteps,
    useCases,
    alternatives,
    faqs,
  };
}
