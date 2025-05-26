# brainsenseWeb
🚀 회사 홈페이지 개발 프로젝트

# 🏢 프로젝트명
brainsense 공식 홈페이지 제작

## 📌 프로젝트 개요
본 프로젝트는 회사의 공식 홈페이지를 개발하는 팀 프로젝트입니다.  
HTML, CSS, JavaScript, EJS Template, NODE.JS, MongoDB 등을 활용하여 반응형 웹사이트를 제작합니다.

---

## 🚀 주요 기능
- 회사 소개 페이지
- 서비스 및 제품 페이지
- 연락처 및 문의 양식
- 반응형 웹 디자인
- (추후 추가 예정)

---

## 🛠 사용 기술
- **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
- **Backend:** Server / Node.JS(Express 기반) DB / MongoDB(NoSQL)
- **Templating:** EJS
- **Version Control:** Git, GitHub
- **Deployment:** (Cafe24, AWS 등 외부 호스팅)

---

## 📂 프로젝트 구조
- 추가 예정

## 💻 협업 방법
- 추가 예정  

---

## 🗄 Order 테이블 (외주 요청 관리)
외주 요청을 관리하기 위해 MongoDB에 `Order` 테이블을 생성합니다.  
이 테이블은 **외주 주문 내역을 저장**하며, 주문의 진행 상태를 추적할 수 있습니다.

### 📂 Order 테이블 필드 정의
| 필드명              | 타입             | 필수 여부 | 설명 |
|-------------------|----------------|---------|----------------------------------|
| `_id`            | `ObjectId`      | ✅       | **PK**, MongoDB 자동 생성 식별자 |
| `orderNumber`    | `String`        | ✅       | 주문번호 (예: `ORD20250001`), **고유값** |
| `companyName`    | `String`        | ✅       | 외주를 의뢰한 **회사 이름** |
| `companyAddress` | `String`        | ✅       | 외주 회사의 **주소** |
| `companyEmail`   | `String`        | ✅       | 외주 회사의 **이메일** |
| `companyPhone`   | `String`        | ✅       | 외주 회사의 **전화번호** |
| `orderType`      | `String (enum)` | ✅       | **외주 유형** (예: `소프트웨어`, `센서`, `기타`) |
| `details`        | `String`        | ✅       | **세부 문의 사항** |
| `privacyConsent` | `Boolean`       | ✅       | **개인정보 수집 동의 여부** (`true / false`) |
| `timestamp`      | `Date`          | ✅       | **요청 생성 시간** (자동 추가) |
| `status`         | `String (enum)` | ✅       | **진행 상태** (`처리전`, `진행중`, `완료`) |

---

### 📌 Order 테이블 사용 예시
```json
{
    "_id": "65a8e3a2f0b5c00bdf123456",
    "orderNumber": "ORD20250001",
    "companyName": "BrainSense Corp.",
    "companyAddress": "Seoul, South Korea",
    "companyEmail": "contact@brainsense.com",
    "companyPhone": "+82-10-1234-5678",
    "orderType": "소프트웨어",
    "details": "AI 기반 IoT 솔루션 개발 요청",
    "privacyConsent": true,
    "timestamp": "2025-02-10T14:25:36.000Z",
    "status": "처리전"
}
