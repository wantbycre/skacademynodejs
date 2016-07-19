**Node.js Skacademy Study**
===

SK상생아카데미 Node.js 수업 
- 기본 개념
- 서버생성
- 비동기/동기 방식의 이해
- npm의 개념 및 설치 
- jade/ejs/connect의 설치 및 실습
- express 설치 및 실습
- RESTfulAPI 개념 학습
- RESTfulAPI 실습
- Soket.io 개념 학습
- Soket.io 실습

**다운로드**
---

http://gitlab2.uit.nhncorp.com/RND/nts-markupinclude/tree/master/dist

**데모**
---

- **기본**: http://gitlab2.uit.nhncorp.com/RND/nts-markupinclude/tree/master/demo/basic
- **인클루드 메뉴 O, 프레임 자동 인클루드 X**: http://gitlab2.uit.nhncorp.com/RND/nts-markupinclude/tree/master/demo/nav

**프로그램 순서도**
---

![프로그램 순서도](http://view.gitlab2.uit.nhncorp.com/RND/nts-markupinclude/raw/master/readme/program-flow-diagram.gif)

- View: 현재 페이지
- Config: 템플릿 환경설정
- Layout: 레이아웃 마크업
- Frame: 프레임(인클루드) 마크업
- Component: 컴포넌트(인클루드) 마크업

**사용법**
---

### **HTML**

#### **프레임워크 스크립트 호출**

```html
<script src="jquery.min.js"></script>
<script src="jquery.xdomainrequest.min.js"></script>
<script src="/nts_modules/nts-markupinclude/nts.markupinclude.js" data-markup-root="/"></script>
```

head 태그 내에서 프레임워크 스크립트를 호출함

- Attribute: ```src```, ```data-markup-root```

> - 프레임워크 스크립트 파일을 호출 시 ```src``` 애트리뷰트의 값을 저장소의 루트 디렉토리까지 진입시키거나, ```data-markup-root``` 애트리뷰트를 이용하여 루트 디렉토리를 명시하여야 함.

#### **템플릿 환경설정 링크**

```html
<html data-markup-layout="@example.json"></html>
```

- Attribute: ```data-markup-layout```

현재 페이지에서 사용할 인클루드 환경설정 JSON 파일의 경로를 정의

#### **페이지 컨텐츠 영역 링크**

```html
<div data-markup-content="@example">...</div>
```

- Attribute: ```data-markup-content```

현재 영역에 보여질 페이지 컨텐츠

#### **레이아웃 프레임 인클루드**

```html
<div data-markup-frame="@example">...</div>
```

- Attribute: ```data-markup-frame```

모든 페이지에 인클루드될 레이아웃 프레임 영역

#### **마크업 컴포넌트 인클루드**

```html
<div data-markup-component="@example">...</div>
```

- Attribute: ```data-markup-component```

현재 영역에 인클루드될 마크업 컴포넌트

#### **URL 인클루드**

```html
<div data-markup-url="@http://example.com">...</div>
```

- Attribute: ```data-markup-url```

URL을 통하여 가져올 인클루드 영역

#### **인클루드 선택자**

```html
<div data-markup-selector="@div.example">...</div>
```

- Attribute: ```data-markup-selector```

인클루드 파일 내에서 가져올 영역

### **JavaScript**

> - AJAX로 인클루드되는 영역을 스크립트로 제어 시 기존의 ```DOM ready```, ```load``` 이벤트 리스너 대신 프레임워크에서 제공하는 커스텀 이벤트 리스너를 사용하여야 함.

#### **HTML 인클루드 완료 이벤트 리스너**

```javascript
window.markupinclude.ready(function() {
	...
});
```

- Method: ```window.markupinclude.ready```

HTML 인클루드가 완료되었을 때(DOM이 준비되었을 때)를 나타내는 이벤트 리스너

#### **스크립트 인클루드 완료 이벤트 리스너**

```javascript
window.markupinclude.load(function() {
	...
});
```

- Method: ```window.markupinclude.load```

HTML을 포함하여 스크립트까지 인클루드가 완료되었을 때를 나타내는 이벤트 리스너

**템플릿 환경설정**
---

디렉토리 경로 (저장소의 Root 디렉토리 기준)

```json
{
	"path": {
		"src": "/src",
		"layout": "/src/layout",
		"frame": "/src/frame",
		"component": "/src/component",
		"script": "/src/js"
	},
	"view": {
		"@view": "@케이스 명"
	},
	"layout": "@layout.html",
	"frame": { 
		"@frame": {
			"default": "@frame.html",
			"@view": "@frame_@view.html"
		}
	},
	"component": { 
		"@component": "@component.html"
	},
	"script": {
		"@script": {
			"name": "@스크립트 명",
			"file": "@script.js"
		}
	},
	"options": {
		"autoinclude": "true",
		"shownav": "false",
		"xhtml": "false",
		"async": "true",
		"timeout": "15000"
	}
}
```

### **options**

옵션

```json
"options": {
	"autoinclude": "true",
	"shownav": "false",
	"xhtml": "false",
	"async": "true",
	"timeout": "15000"
}
```

#### **options.autoinclude**

레이아웃 프레임 자동 인클루드 여부

- Type: ```String```
- Default value: ```"true"```

#### **options.shownav**

인클루드 메뉴 활성화 여부

- Type: ```String```
- Default value: ```"false"```

#### **options.xhtml**

xhtml 사용 여부

- Type: ```String```
- Default value: ```"false"```

#### **options.async**

인클루드 시 비동기 통신 사용 여부

- Type: ```String```
- Default value: ```"true"```

#### **options.timeout**

인클루드 시 리퀘스트 타임아웃 제한(1000 = 1초)

- Type: ```String(to integer)```
- Default value: ```15000```

### **path**

디렉토리 경로 (저장소의 Root 디렉토리 기준)

```json
"path": {
	"src": "/src",
	"layout": "/src/layout",
	"frame": "/src/frame",
	"component": "/src/component",
	"script": "/src/js"
}
```

#### **path.src**

마크업 뷰 파일이 존재하는 디렉토리

- Type: ```String```
- Default value: ```"/src"```

#### **path.layout**

레이아웃 템플릿 및 환경설정 파일이 존재하는 디렉토리

- Type: ```String```
- Default value: ```"/src/layout"```

#### **path.frame**

인클루드할 레이아웃 프레임 파일이 존재하는 디렉토리

- Type: ```String```
- Default value: ```"/src/frame"```

#### **path.component**

인클루드할 마크업 컴포넌트 파일이 존재하는 디렉토리

- Type: ```String```
- Default value: ```"/src/component"```

#### **path.script**

인클루드할 스크립트 파일이 존재하는 디렉토리

- Type: ```String```
- Default value: ```"/src/js"```

### **view**

프레임 인클루드 케이스 파라미터

```json
"view": {
	"@view": "@케이스 명"
}
```

> ```options.shownav```의 값이 true일 경우에만 지원됨.

#### **view.```@view```**

케이스별 뷰를 위한 파라미터명 (http://…?layout&view=```@view```)

- Type: ```String```
- Default value: ```undefined```

### **layout**

레이아웃 템플릿 파일 (path.layout 디렉토리 기준)

```json
"layout": "@layout.html"
```

- Type: ```String```
- Default value: ```"{JSON Filename}.html"```

### **frame**

레이아웃 프레임 파일 (path.frame 디렉토리 기준)

```json
"frame": { 
	"@frame": {
		"default": "@frame.html",
		"@view": "@frame_@view.html"
	}
}
```

#### **frame.```@frame```**

레이아웃 프레임 영역 (data-markup-frame="```@frame```")`

##### **frame.```@frame```.default**

기본으로 인클루드할 파일

- Type: ```String```
- Default value: ```undefined```

##### **frame.```@frame```.```@view```**

파라미터별로 인클루드할 파일 (http://…?layout&view=```@view```)

- Type: ```String```
- Default value: ```undefined```

### **component**

마크업 컴포넌트 파일 (path.component 디렉토리 기준)

```json
"component": { 
	"@component": "@component.html"
}
```

#### **component.```@component```**

마크업 컴포넌트 영역 (data-markup-component="```@component```")

- Type: ```String```
- Default value: ```undefined```

### **script**

인클루드할 스크립트 정의

```json
"script": {
	"@script": {
		"name": "@스크립트 명",
		"file": "@script.js"
	}
}
```

> ```options.shownav```의 값이 true일 경우에만 지원됨.

#### **script.```@script```**

스크립트를 불러올 파라미터명 (http://…?script=```@script```,```@script```)

##### **script.```@script```.name**

스크립트의 이름

- Type: ```String```
- Default value: ```undefined```

##### **script.```@script```.file**

스크립트의 파일명

- Type: ```String```
- Default value: ```undefined```

**자동화 도구(Grunt)**
---

### **grunt-nts-layout-rebase** 

http://gitlab2.uit.nhncorp.com/RND/grunt-nts-layout-rebase/tree/master

레이아웃 일괄 변경 자동화

#### **Node 모듈 설정**

/package.json

```json
{
	"devDependencies": {
		"grunt-nts-layout-rebase": "http://gitlab2.uit.nhncorp.com/RND/grunt-nts-layout-rebase/raw/master/dist/grunt-nts-layout-rebase-latest.tgz"
	}
}
```

#### **Node 모듈 설치**

```shell
npm install --save-dev
```

**예정 작업**
---

- 컴포넌트를 케이스별로 컨트롤할 수 있는 애트리뷰트 제공

**예제**
---

### **템플릿 환경설정**

/src/layout/layout.json

```json
{
	"path": {
		"src": "/src",
		"layout": "/src/layout",
		"frame": "/src/frame",
		"component": "/src/component",
		"script": "/src/js"
	},
	"view": {
		"blog": "블로그탭 검색",
		"cafe": "카페탭 검색",
		"image": "이미지탭 검색"
	},
	"layout": "layout.html",
	"frame": {
		"header": {
			"default": "header.html"
		},
		"lnb": {
			"default": "lnb.html"
		},
		"snb": {
			"default": "snb.html",
			"blog": "snb_blog.html",
			"cafe": "snb_cafe.html",
			"image": "snb_image.html"
		},
		"footer": {
			"default": "footer.html"
		}
	},
	"component": {
		"nav_tab": "nav_tab.html"
	}
}
```

### **템플릿 마크업 및 프레임, 컨텐츠 영역 정의**

/src/layout/layout.html

```html
<!DOCTYPE HTML>
<html lang="ko" data-markup-layout="./layout.json">
<head>

<!-- 마크업 인클루드 프레임워크 호출 -->
<script src="../js/jquery.min.js"></script>
<script src="../js/jquery.xdomainrequest.min.js"></script>
<script src="../../nts_modules/nts-markupinclude/nts.markupinclude.js"></script>

</head>
<body>

<!-- 레이아웃 프레임 영역: header -->
<div id="header" data-markup-frame="header">
	<img src="../img/@header.png" alt="Header" style="display:block">
</div>

<!-- 레이아웃 프레임 영역: lnb -->
<div id="lnb" data-markup-frame="lnb">
	<img src="../img/@lnb.png" alt="Local Navigation Bar" style="display:block">
</div>

<!-- 레이아웃 프레임 영역: snb -->
<div id="snb" data-markup-frame="snb">
	<img src="../img/@snb.png" alt="Sub Navigation Bar" style="display:block">
</div>

	<!-- 페이지 컨텐츠 영역: section_main -->
	<div class="section_main" data-markup-content="section_main">
			<img src="../img/@section_main.png" alt="Dummy Collection" style="display:block">
	</div>

<!-- 레이아웃 프레임 영역: footer -->
<div id="footer" data-markup-frame="footer">
	<img src="../img/@footer.png" alt="Footer" style="display:block">
</div>

</body>
</html>
```

### **프레임 마크업**

/src/frame/snb.html

```html
<div id="snb">
	프레임 작성
</div>
```

### **컴포넌트 마크업**

/src/component/nav_tab.html

```html
<div class="nav_tab">
	컴포넌트 작성
</div>
```

### **페이지 마크업**

/src/01_xxx/example.html

```html
<!DOCTYPE HTML>
<html lang="ko" data-markup-layout="../layout/layout.json">
<head>

<!-- 마크업 인클루드 프레임워크 호출 -->
<script src="../js/jquery.min.js"></script>
<script src="../js/jquery.xdomainrequest.min.js"></script>
<script src="../../nts_modules/nts-markupinclude/nts.markupinclude.js"></script>

</head>
<body>

<!-- 레이아웃 프레임 영역: header -->
<div id="header" data-markup-frame="header">
	<img src="../img/@header.png" alt="Header" style="display:block">
</div>

<!-- 레이아웃 프레임 영역: lnb -->
<div id="lnb" data-markup-frame="lnb">
	<img src="../img/@lnb.png" alt="Local Navigation Bar" style="display:block">
</div>

<!-- 레이아웃 프레임 영역: snb -->
<div id="snb" data-markup-frame="snb">
	<img src="../img/@snb.png" alt="Sub Navigation Bar" style="display:block">
</div>

	<!-- 페이지 컨텐츠 영역: section_main -->
	<div class="section_main" data-markup-content="section_main">
		
		<div data-markup-component="nav_tab">
			컴포넌트 인클루드 영역
		</div>
	
		컨텐츠 작성
		
		<div data-markup-url="http://view.gitlab2.uit.nhncorp.com/RND/nts-markupinclude/raw/master/demo/src/component/nav_tab.html">
			URL 인클루드 영역
		</div>
	
		<div data-markup-url="http://view.gitlab2.uit.nhncorp.com/search-ui/m-search/raw/master/03_site/sp_site.html" data-markup-selector=".sp_site .site_banner">
			URL + 선택자 인클루드 영역
		</div>
		
	</div>

<!-- 레이아웃 프레임 영역: footer -->
<div id="footer" data-markup-frame="footer">
	<img src="../img/@footer.png" alt="Footer" style="display:block">
</div>

</body>
</html>
```