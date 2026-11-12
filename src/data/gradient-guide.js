export const GRADIENT_GUIDE = {
  slug: 'tu-bang-mau-den-css-gradient-vi-du-co-the-tai-hien',
  title: 'Từ bảng màu đến nền CSS: một ví dụ có thể tự kiểm tra',
  category: 'Ví dụ thực hành', publishedAt: '2026-11-12', readingTime: '6 phút đọc', relatedCategory: 'thiet-ke',
  excerpt: 'Tự dựng một nền chuyển sắc với hai màu cố định, so sánh ba cách đặt điểm dừng và biết khi nào cần công cụ tạo gradient thay vì chỉ một bảng màu.',
  keyTakeaways: [
    'Bảng màu cung cấp màu; gradient cần thêm hướng và vị trí chuyển màu.',
    'Dùng cùng hai màu khi so sánh để thấy tác động của điểm dừng.',
    'Một đoạn CSS tái hiện được hữu ích hơn lời khẳng định công cụ “đẹp” hay “nhanh”.',
  ],
  sources: [
    { title: 'CSS Gradient — giao diện tạo gradient và mã CSS', url: 'https://cssgradient.io/' },
    { title: 'MDN — linear-gradient(): cú pháp và điểm dừng', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/gradient/linear-gradient' },
  ],
  sections: [
    { heading: 'Bài toán: một nền cho thẻ giới thiệu, không phải cả bộ nhận diện', paragraphs: [
      'Giả sử bạn đã có hai màu ví dụ #123D2A và #B8D9AA, muốn làm nền cho một thẻ giới thiệu. Hai mã màu chưa quyết định được nền sẽ chuyển từ trái sang phải hay trên xuống dưới, và màu đậm sẽ chiếm bao nhiêu diện tích. Bước còn thiếu là đặt hướng cùng các điểm dừng.',
      'Trong bài này, hai màu là dữ liệu minh họa do Toolchoice chọn, không phải bảng màu của một thương hiệu và không phải kết quả chấm điểm một sản phẩm. Mẫu hiển thị được trình duyệt dựng trực tiếp từ CSS bên dưới. Bạn có thể sao chép, đổi kích thước và đối chiếu kết quả.',
    ] },
    { heading: 'Mẫu A: chuyển đều từ trái sang phải', paragraphs: [
      'Tạo một vùng có chiều cao 180px. Dòng background đầu tiên là màu nền đơn; dòng tiếp theo áp dụng ảnh gradient. Hai điểm 0% và 100% đặt hai màu ở hai đầu trục. Hướng 90deg chạy từ trái sang phải.',
      'Nếu bạn muốn dùng giao diện CSS Gradient để dựng lại, chọn Linear, góc 90, đặt hai màu và vị trí tương ứng rồi đối chiếu CSS xuất ra. Giá trị alpha nên là 1 để tránh màu nền phía sau ảnh hưởng đến phép so sánh. Mô tả giao diện được đối chiếu với trang chính thức ngày 12/11/2026; đây không phải thử nghiệm tất cả tính năng hoặc gói giá của dịch vụ.',
    ], code: '.sample {\n  min-height: 180px;\n  background: #123D2A;\n  background-image: linear-gradient(90deg, #123D2A 0%, #B8D9AA 100%);\n}', gradient: 'linear-gradient(90deg, #123D2A 0%, #B8D9AA 100%)' },
    { heading: 'Mẫu B và C: cùng màu nhưng kết quả khác', paragraphs: [
      'Để vùng bên trái giữ màu đậm lâu hơn, đưa điểm dừng đầu đến 35%. Với mẫu B, phần đầu trục đến 35% giữ màu đậm rồi mới chuyển sang màu sáng. Nếu bạn cần ranh giới sắc nét thay vì chuyển êm, đặt cả hai điểm dừng ở 50% như mẫu C.',
      'Đây là ba thiết lập có thể tái hiện trên trình duyệt. Chúng không phải xếp hạng thẩm mỹ: một ranh giới rõ có thể phù hợp cho bố cục chia đôi nhưng không phù hợp nếu mục tiêu của bạn là nền chuyển êm.',
    ], comparisonTable: { caption: 'Ba thiết lập cho cùng một cặp màu', headers: ['Mẫu', 'CSS cho background-image', 'Điều cần quan sát'], rows: [
      ['A', 'linear-gradient(90deg, #123D2A 0%, #B8D9AA 100%)', 'Màu chuyển trên toàn trục.'],
      ['B', 'linear-gradient(90deg, #123D2A 35%, #B8D9AA 100%)', 'Phần đầu giữ màu đậm đến điểm 35%.'],
      ['C', 'linear-gradient(90deg, #123D2A 50%, #B8D9AA 50%)', 'Hai màu gặp nhau ở một ranh giới sắc nét.'],
    ] } },
    { heading: 'Cách kiểm tra trước khi dùng vào giao diện thật', paragraphs: [
      'Thử vùng hiển thị rộng 320px và 960px với cùng chiều cao. Góc dùng đơn vị độ và điểm dừng dùng phần trăm, nên diện tích cảm nhận sẽ thay đổi theo hình dạng vùng nền. Nếu chuyển sang 180deg, nền chạy từ trên xuống dưới; hãy kiểm tra lại vị trí chữ và nút.',
      'Không suy ra rằng chữ trắng hay đen luôn dễ đọc trên toàn gradient. Hãy kiểm tra tương phản ở vùng thực sự có chữ; lựa chọn an toàn khi chưa đo được là đặt nội dung trên một lớp nền đơn có độ tương phản rõ. Bản xem trước ở đây không có chữ chồng lên nền để tránh tạo một kết luận tương phản chưa được kiểm chứng.',
      'Nếu chỉ cần tái sử dụng nền này, đoạn CSS đã đủ; không cần tải ảnh hoặc thêm một dịch vụ vào ứng dụng. Nếu cần kéo điểm dừng và xem thay đổi trực quan, giao diện tạo gradient sẽ thuận tiện hơn. Một thư viện bảng màu giải quyết bước chọn màu, còn công cụ gradient giải quyết cách phối các màu đó trong một nền.',
    ], bullets: ['Lưu lại hai mã màu, hướng và vị trí điểm dừng để tái hiện.', 'Đối chiếu ảnh xem trước với phần tử có đúng kích thước cần dùng.', 'Kiểm tra phiên bản mobile và vùng chữ trước khi xuất bản.', 'Nếu thêm màu thứ ba, ghi rõ vị trí của nó thay vì chỉ sao chép ảnh.'] },
  ],
};
