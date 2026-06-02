/**
 * Type Defender — Input Module
 * --------------------------------------------------------------------------
 * 키 입력 + 모바일 터치 입력 처리.
 *
 * 데스크톱: 키보드 입력 → hidden input value 변화 → onInput 콜백
 * 모바일: 화면 터치 → hidden input 포커싱 → 가상 키보드 노출
 *
 * Why hidden input:
 *  - 게임 단어 시각화는 #word-display가 담당 (input은 시각 숨김)
 *  - 모바일 가상 키보드는 input/textarea 포커스가 있어야 노출됨
 *  - inputmode/autocapitalize 등 attribute로 모바일 UX 미세 조정
 *
 * W4 박태준 — 모바일 입력 처리 추가
 */

const Input = {
    _initialized: false,
    _onInput: null,
    _onEnter: null,
    lastValLength: 0, // PR-K: 글자 단위 매칭용 (마지막 입력 길이 추적)

    init(onInput, onEnter) {
        // PR-B: idempotent 가드 — 재시작 시 두 번째 호출되어도 이벤트 리스너 중복 등록 방지.
        // 콜백만 갱신해서 새 game 객체를 참조하도록 함.
        this._onInput = onInput;
        this._onEnter = onEnter;
        if (this._initialized) return;

        const hiddenInput = document.getElementById('hidden-input');
        if (!hiddenInput) return;

        // 모바일 가상 키보드 UX 강화 — 자동 대문자/스마트 따옴표 등 비활성화
        hiddenInput.setAttribute('autocomplete', 'off');
        hiddenInput.setAttribute('autocorrect', 'off');
        hiddenInput.setAttribute('autocapitalize', 'off');
        hiddenInput.setAttribute('spellcheck', 'false');
        hiddenInput.setAttribute('inputmode', 'text');

        // 포커스 헬퍼 — 입력이 끊기지 않게 hidden input에 포커스 유지
        const focusInput = () => {
            try {
                hiddenInput.focus({ preventScroll: true });
            } catch (_) {
                hiddenInput.focus();
            }
        };

        // 데스크톱: 노트북 영역 클릭 시 포커스
        const gameArea = document.querySelector('.notebook-input');
        if (gameArea) {
            gameArea.addEventListener('click', focusInput);
        }

        // 모바일: 게임 영역 전체 터치 시 포커스 (가상 키보드 노출)
        const playScene = document.querySelector('.play-scene');
        if (playScene) {
            playScene.addEventListener('touchstart', (e) => {
                // 버튼/링크 터치는 그대로 (focus 변경 안 함)
                if (e.target.closest('button, a, input, textarea, select')) return;
                focusInput();
            }, { passive: true });
        }

        // 페이지 가시성 회복 시 (모바일 탭 전환 후 복귀 등) 포커스 복원
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                const isPlayActive = document.querySelector('.play-scene.is-active');
                if (isPlayActive) focusInput();
            }
        });

        hiddenInput.addEventListener('input', () => {
            if (typeof this._onInput === 'function') this._onInput(hiddenInput.value);
        });

        hiddenInput.addEventListener('keydown', (e) => {
            if (e.isComposing) return;
            if (e.key === 'Enter') {
                e.preventDefault();
                if (typeof this._onEnter === 'function') this._onEnter(hiddenInput.value.trim());
                hiddenInput.value = '';
            }
        });

        this._initialized = true;
    }
};
