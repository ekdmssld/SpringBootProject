document.addEventListener('DOMContentLoaded', function () {
  // ✅ Quill 에디터 초기화 함수
  function initializeQuill(editorId) {
    var quill = new Quill(editorId, {
      theme: 'snow',
      placeholder: '내용을 입력하세요...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image', 'video', 'code-block', 'blockquote'],
          [{ font: [] }],
          [{ size: [] }],
          [{ color: [] }, { background: [] }],
          ['clean'],
        ],
        clipboard: {
          // 📌 클립보드 설정 추가
          matchVisual: false, // 스타일 제거
          matchers: [
            // 🧹 모든 태그에서 텍스트만 남기기
            [
              '*',
              function (node, delta) {
                // 줄바꿈이나 특수문자 정리
                delta.ops = delta.ops.map((op) => {
                  if (op.insert && typeof op.insert === 'string') {
                    op.insert = op.insert.replace(/\n/g, ' ').trim();
                  }
                  return op;
                });
                return delta;
              },
            ],
          ],
        },
      },
    });

    // 📌 붙여넣기 시 불필요한 HTML을 제거하는 이벤트
    quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node, delta) {
      delta.ops = delta.ops.map((op) => {
        if (op.insert && typeof op.insert === 'string') {
          // HTML 태그 제거 및 특수문자 이스케이프
          op.insert = op.insert.replace(/<[^>]*>?/gm, '').replace(/"/g, '&quot;');
        }
        return op;
      });
      return delta;
    });

    return quill;
  }

  // HTML 인코딩된 문자열을 디코딩하는 함수
  function decodeHtmlEntities(str) {
    var txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  // 게시글 수정 모달을 열 때
  document.addEventListener('click', function (event) {
    let button = event.target.closest("[data-bs-target='#editModal']");
    if (button) {
      let postId = button.getAttribute('data-id');
      let postTitle = decodeHtmlEntities(button.getAttribute('data-title'));
      let postSource = decodeHtmlEntities(button.getAttribute('data-source'));
      let postContent = decodeHtmlEntities(button.getAttribute('data-content'));
      let attachments = JSON.parse(
        button.getAttribute('data-attachments') || '[]'
      );

      console.log('받아온 첨부 파일 목록:', attachments);

      document.getElementById('postId').value = postId;
      document.getElementById('postTitle').value = postTitle;
      document.getElementById('postSource').value = postSource;
      editQuill.root.innerHTML = '';
      editQuill.clipboard.dangerouslyPasteHTML(postContent);

      // 기타 기존 첨부 파일 표시 로직 유지
    }
  });

  // ✅ Quill 에디터 초기화 (게시글 작성)
  var quill = initializeQuill('#editor');

  // ✅ Quill 에디터 초기화 (게시글 수정)
  var editQuill = initializeQuill('#editEditor');

  // 📌 게시글 작성 (Create)
  var newPostForm = document.getElementById('newPostForm');
  var newPostAttachments = document.getElementById('newPostAttachments');
  var newAttachmentPreview = document.getElementById('newAttachmentPreview');

  if (newPostAttachments) {
    newPostAttachments.addEventListener('change', function () {
      newAttachmentPreview.innerHTML = '';
      let fileList = "<h6>📎 업로드된 파일 목록</h6><ul class='list-group'>";

      Array.from(newPostAttachments.files).forEach((file) => {
        fileList += `
                    <li class="list-group-item">${file.name}</li>
                `;
      });

      fileList += '</ul>';
      newAttachmentPreview.innerHTML = fileList;
    });
  }

  if (newPostForm) {
    newPostForm.addEventListener('submit', function (event) {
      event.preventDefault();
      document.getElementById('newPostContent').value = quill.root.innerHTML;
      var formData = new FormData(newPostForm);

      console.log('전송할 formData : ', [...formData.entries()]);

      $.ajax({
        url: '/api/posts',
        method: 'POST',
        processData: false,
        contentType: false,
        data: formData,
        success: function () {
          alert('게시글이 추가되었습니다.');
          location.reload();
        },
        error: function (error) {
          console.log('게시글 추가 오류', error.responseJSON);
          if (error.responseJSON && error.responseJSON.error) {
            alert('오류 : ' + error.responseJSON.error);
          } else {
            alert('게시글 추가에 실패했습니다.');
          }
        },
      });
    });
  }

  // 📌 게시글 수정 (Update)
  let editModal = document.getElementById('editModal');
  let deletedAttachments = []; // 삭제된 파일 목록 저장

  if (editModal) {
    document.addEventListener('click', function (event) {
      let button = event.target.closest("[data-bs-target='#editModal']");
      if (button) {
        let postId = button.getAttribute('data-id');
        let postTitle = button.getAttribute('data-title');
        let postSource = button.getAttribute('data-source');
        let postContent = button.getAttribute('data-content');
        let attachments = JSON.parse(
          button.getAttribute('data-attachments') || '[]'
        );

        console.log('받아온 첨부 파일 목록:', attachments); // 🛠 확인용 로그

        document.getElementById('postId').value = postId;
        document.getElementById('postTitle').value = postTitle;
        document.getElementById('postSource').value = postSource;
        editQuill.root.innerHTML = '';
        editQuill.clipboard.dangerouslyPasteHTML(postContent);

        deletedAttachments = [];

        // 📌 기존 첨부 파일(이미지 + 문서) 미리보기 추가
        let editAttachmentsContainer = document.getElementById(
          'editAttachmentsContainer'
        );
        editAttachmentsContainer.innerHTML = '';

        if (attachments.length > 0) {
          attachments.forEach((file) => {
            editAttachmentsContainer.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <a href="${file.cloudPath}" target="_blank" download class="text-decoration-none">
                  ${file.originalName}
                </a>
                <button class="btn btn-sm btn-danger remove-attachment" 
                        data-file-safe-name="${file.safeName}" 
                        data-file-original-name="${file.originalName}">
                    삭제
                </button>
            </li>`;
          });
        } else {
          editAttachmentsContainer.innerHTML =
            "<p class='text-muted'>첨부된 파일이 없습니다.</p>";
        }
      }
    });

    // 📌 동적 이벤트 위임 (기존 파일 삭제 버튼 동작)
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('remove-attachment')) {
        const safeName = event.target.getAttribute('data-file-safe-name');
        const originalName = event.target.getAttribute(
          'data-file-original-name'
        );
        if (safeName && originalName) {
          deletedAttachments.push({ safeName, originalName });
          event.target.parentElement.remove(); // 리스트에서 제거
          console.log('삭제된 첨부 파일 목록:', deletedAttachments);
        }
      }
    });

    var editForm = document.getElementById('editForm');
    if (editForm) {
      editForm.addEventListener('submit', function (event) {
        event.preventDefault();
        document.getElementById('editPostContent').value =
          editQuill.root.innerHTML;

        let postId = document.getElementById('postId').value;
        let formData = new FormData(editForm);
        formData.append(
          'deletedAttachments',
          JSON.stringify(deletedAttachments)
        );

        $.ajax({
          url: '/api/posts/' + postId,
          method: 'PUT',
          processData: false,
          contentType: false,
          data: formData,
          success: function () {
            alert('게시글이 수정되었습니다.');
            location.reload();
          },
          error: function (error) {
            console.log('수정 오류', error);
            alert('수정에 실패했습니다.');
          },
        });
      });
    }
  }

  // 📌 새 파일 선택 시 업로드한 파일 목록 표시
  var editPostAttachments = document.getElementById('editPostAttachments');
  var attachmentPreview = document.getElementById('attachmentPreview');

  if (editPostAttachments) {
    editPostAttachments.addEventListener('change', function () {
      attachmentPreview.innerHTML = '';
      let fileList = "<h6>📎 업로드된 파일 목록</h6><ul class='list-group'>";

      Array.from(editPostAttachments.files).forEach((file) => {
        fileList += `
        <li class="list-group-item">${file.name}</li>
      `;
      });

      fileList += '</ul>';
      attachmentPreview.innerHTML = fileList;
    });
  }

  // 📌 게시글 보기 (Read)
  var viewPostModal = document.getElementById('viewPostModal');
  if (viewPostModal) {
    document.addEventListener('click', function (event) {
      let button = event.target.closest("[data-bs-target='#viewPostModal']");
      if (button) {
        let postTitle = button.getAttribute('data-title');
        let postSource = button.getAttribute('data-source');
        let postContent = button.getAttribute('data-content');
        let attachments = JSON.parse(
          button.getAttribute('data-attachments') || '[]'
        );

        let createdAt = button.getAttribute('data-created-at');
        let updatedAt = button.getAttribute('data-updated-at');

        document.getElementById('viewPostTitle').textContent = postTitle;
        // document.getElementById("viewPostContent").innerHTML = postContent;
        // 📌 Quill 스타일 적용 (기존 내용에 ql-editor 클래스를 추가)
        document.getElementById(
          'viewPostContent'
        ).innerHTML = `<div class="ql-editor">${postContent}</div>`;
        document.getElementById('viewPostSource').textContent = postSource;

        // 📌 날짜 포맷 변경 (YYYY-MM-DD HH:mm:ss 형식)
        function formatDate(dateString) {
          let date = new Date(dateString);
          return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        }

        // 📌 생성시간 및 수정시간 표시
        let timeDisplay = `작성: ${formatDate(createdAt)}`;
        if (updatedAt && createdAt !== updatedAt) {
          timeDisplay += ` | 수정: ${formatDate(updatedAt)}`;
        }
        document.getElementById('viewPostTime').textContent = timeDisplay;

        let attachmentsContainer = document.getElementById(
          'viewPostAttachments'
        );
        attachmentsContainer.innerHTML = '';

        if (attachments.length > 0) {
          let fileList = "<h6>📎 첨부 파일</h6><ul class='list-group'>";
          attachments.forEach((file) => {
            fileList += `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <a href="${file.cloudPath}" target="_blank" download class="text-decoration-none">${file.originalName}</a>
                                <button class="btn btn-sm btn-primary download-btn" data-file="${file.safeName}" data-filename="${file.originalName}">
                                    다운로드
                                </button>
                            </li>
                        `;
          });
          fileList += '</ul>';
          attachmentsContainer.innerHTML = fileList;

          document.querySelectorAll('.download-btn').forEach((btn) => {
            btn.addEventListener('click', function () {
              let fileUrl = this.getAttribute('data-file');
              let fileName = this.getAttribute('data-filename');

              let a = document.createElement('a');
              a.href = fileUrl;
              a.setAttribute('download', fileName);
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            });
          });
        }
      }
    });
  }
});

// 📌 게시글 삭제 (Delete)
function confirmDelete(postId) {
  if (confirm('진짜 삭제하겠습니까?')) {
    $.ajax({
      url: '/api/posts/' + postId,
      method: 'DELETE',
      success: function () {
        alert('게시글이 삭제되었습니다.');
        location.reload();
      },
      error: function (error) {
        console.log('삭제 오류', error);
        alert('삭제에 실패했습니다.');
      },
    });
  }
}
