// ==UserScript==
// @name         VSCode Marketplace Protocol Switcher
// @name:zh      VSCode 市场协议切换器
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Customize the protocol prefix for VSCode Marketplace install buttons (e.g., vscode, antigravity, windsurf, cursor, etc.)
// @description:zh 自定义 VSCode 市场安装按钮的协议前缀（如 vscode, antigravity, windsurf, cursor 等）
// @author       https://github.com/CookSleep
// @match        https://marketplace.visualstudio.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @license      GPLv3
// @downloadURL  https://github.com/CookSleep/VSCode-Marketplace-Protocol-Switcher/raw/main/vscode-installer.user.js
// @updateURL    https://github.com/CookSleep/VSCode-Marketplace-Protocol-Switcher/raw/main/vscode-installer.user.js
// ==/UserScript==

(function () {
    'use strict';

    // 语言配置
    const translations = {
        'zh': {
            menu_command: "设置 VSCode 协议",
            modal_title: "设置 VSCode 协议",
            modal_desc: "选择或输入安装扩展时使用的协议前缀：",
            loading: "正在加载...",
            custom_option: "自定义...",
            custom_placeholder: "输入自定义协议",
            cancel: "取消",
            save: "保存"
        },
        'en': {
            menu_command: "Set VSCode Protocol",
            modal_title: "Set VSCode Protocol",
            modal_desc: "Select or enter the protocol prefix for installing extensions:",
            loading: "Loading...",
            custom_option: "Custom...",
            custom_placeholder: "Enter custom protocol",
            cancel: "Cancel",
            save: "Save"
        }
    };

    // 获取当前语言
    const lang = (navigator.language || navigator.userLanguage).startsWith('zh') ? 'zh' : 'en';
    const t = translations[lang];

    // 默认协议
    const DEFAULT_PROTOCOL = 'vscode';

    // 获取保存的协议
    function getSavedProtocol() {
        return GM_getValue('vscode_protocol', DEFAULT_PROTOCOL);
    }

    // 更新安装链接
    function updateInstallLinks() {
        const protocol = getSavedProtocol();
        const selector = 'a[href*="extension/"]';
        const installButtons = document.querySelectorAll(selector);

        installButtons.forEach(btn => {
            const href = btn.getAttribute('href');
            if (!href) return;

            // 匹配格式如 vscode:extension/publisher.name 或类似的
            const match = href.match(/^([^:]+):extension\/([^?#]+)/);
            if (match) {
                const currentBtnProtocol = match[1];
                const extensionId = match[2];

                const newHref = `${protocol}:extension/${extensionId}`;
                if (href !== newHref) {
                    btn.setAttribute('href', newHref);
                    btn.dataset.originalProtocol = currentBtnProtocol;
                }
            }
        });
    }

    // 全局点击拦截（作为备选方案，防止某些框架在点击时重置 href）
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('a[href*="extension/"]');
        if (btn) {
            const protocol = getSavedProtocol();
            const href = btn.getAttribute('href');
            const match = href.match(/^([^:]+):extension\/([^?#]+)/);
            if (match && match[1] !== protocol) {
                e.preventDefault();
                e.stopPropagation();
                const newHref = `${protocol}:extension/${match[2]}`;
                window.location.href = newHref;
            }
        }
    }, true);

    // 监听 DOM 变化以处理动态加载的内容
    const observer = new MutationObserver(() => {
        updateInstallLinks();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 初始执行
    updateInstallLinks();

    // 注册菜单命令
    GM_registerMenuCommand(t.menu_command, showSettingsDialog);

    // 显示设置弹窗
    function showSettingsDialog() {
        if (document.getElementById('vscode-switcher-modal')) return;

        const currentProtocol = getSavedProtocol();
        const modal = document.createElement('div');
        modal.id = 'vscode-switcher-modal';

        modal.innerHTML = `
            <div class="vsc-modal-overlay"></div>
            <div class="vsc-modal-content">
                <h3>${t.modal_title}</h3>
                <p>${t.modal_desc}</p>
                <div class="vsc-input-group">
                    <div class="vsc-custom-select" id="protocol-select-wrapper">
                        <div class="vsc-select-trigger">
                            <span id="vsc-selected-text">${t.loading}</span>
                            <i class="vsc-arrow"></i>
                        </div>
                        <div class="vsc-options-list" id="vsc-options">
                            <div class="vsc-option" data-value="vscode">VS Code (vscode)</div>
                            <div class="vsc-option" data-value="antigravity">Antigravity (antigravity)</div>
                            <div class="vsc-option" data-value="windsurf">Windsurf (windsurf)</div>
                            <div class="vsc-option" data-value="cursor">Cursor (cursor)</div>
                            <div class="vsc-option" data-value="vscodium">VSCodium (vscodium)</div>
                            <div class="vsc-option" data-value="vscode-insiders">VS Code Insiders (vscode-insiders)</div>
                            <div class="vsc-option" data-value="custom">${t.custom_option}</div>
                        </div>
                    </div>
                    <input type="text" id="protocol-custom" placeholder="${t.custom_placeholder}" 
                           style="display: none;"
                           value="${currentProtocol}">
                </div>
                <div class="vsc-actions">
                    <button id="vsc-cancel">${t.cancel}</button>
                    <button id="vsc-save">${t.save}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 样式
        GM_addStyle(`
            #vscode-switcher-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .vsc-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(4px);
            }
            .vsc-modal-content {
                position: relative;
                background: var(--vsc-bg, #ffffff);
                color: var(--vsc-text, #333333);
                padding: 28px;
                border-radius: 16px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                border: 1px solid var(--vsc-input-border);
                width: 360px;
                max-width: 90%;
                animation: vsc-fade-in 0.3s ease-out;
            }
            @keyframes vsc-fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @media (prefers-color-scheme: dark) {
                .vsc-modal-content {
                    --vsc-bg: rgba(30, 30, 30, 0.95);
                    --vsc-text: #ffffff;
                    --vsc-input-bg: rgba(45, 45, 45, 0.8);
                    --vsc-input-border: rgba(255, 255, 255, 0.1);
                }
                .vsc-modal-overlay { background: rgba(0, 0, 0, 0.6); }
            }
            @media (prefers-color-scheme: light) {
                .vsc-modal-content {
                    --vsc-bg: rgba(255, 255, 255, 0.95);
                    --vsc-text: #1a1a1a;
                    --vsc-input-bg: rgba(240, 240, 240, 0.8);
                    --vsc-input-border: rgba(0, 0, 0, 0.1);
                }
            }
            .vsc-modal-content h3 { margin: 0 0 12px 0; font-size: 18px; }
            .vsc-modal-content p { margin: 0 0 16px 0; font-size: 14px; opacity: 0.8; }
            .vsc-input-group { margin-bottom: 20px; position: relative; }
            
            /* Custom Select Styling */
            .vsc-custom-select {
                position: relative;
                width: 100%;
                margin-bottom: 12px;
                user-select: none;
            }
            .vsc-select-trigger {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 14px;
                background: var(--vsc-input-bg);
                border: 1px solid var(--vsc-input-border);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                outline: none !important;
                line-height: 1;
            }
            .vsc-select-trigger:hover { border-color: #0078d4; }
            .vsc-arrow {
                border: solid var(--vsc-text);
                border-width: 0 2px 2px 0;
                display: inline-block;
                padding: 3px;
                transform: rotate(45deg);
                transition: transform 0.2s;
                margin-left: 10px;
                margin-top: -3px;
            }
            .vsc-custom-select.open .vsc-arrow { transform: rotate(-135deg); margin-top: 3px; }
            
            .vsc-options-list {
                position: absolute;
                top: calc(100% + 5px);
                left: 0;
                width: 100%;
                background: var(--vsc-bg);
                border: 1px solid var(--vsc-input-border);
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                z-index: 100;
                display: none;
                animation: vsc-slide-down 0.2s ease-out;
                /* 移除滚动条 */
                overflow: hidden;
            }
            .vsc-custom-select.open .vsc-options-list { display: block; }
            @keyframes vsc-slide-down {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .vsc-option {
                padding: 10px 14px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.15s;
            }
            .vsc-option:hover { background: rgba(0, 120, 212, 0.15); }
            .vsc-option.selected { background: #0078d4; color: white; }
            .vsc-option:first-child { border-top-left-radius: 8px; border-top-right-radius: 8px; }
            .vsc-option:last-child { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }

            .vsc-input-group input {
                width: 100%;
                padding: 10px 14px;
                border-radius: 8px;
                border: 1px solid var(--vsc-input-border);
                background: var(--vsc-input-bg);
                color: var(--vsc-text);
                box-sizing: border-box;
                font-size: 14px;
                outline: none !important;
                transition: border-color 0.2s;
                line-height: 1;
            }
            .vsc-input-group input:focus { border-color: #0078d4; }
            
            .vsc-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
            .vsc-actions button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 10px 24px;
                border-radius: 8px;
                border: none !important;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: background 0.2s, box-shadow 0.2s, opacity 0.2s;
                outline: none !important;
                box-shadow: none !important;
                line-height: 1;
                min-width: 80px;
                user-select: none;
                text-decoration: none !important;
                -webkit-tap-highlight-color: transparent;
            }
            .vsc-actions button:focus, 
            .vsc-actions button:active, 
            .vsc-actions button:focus-visible,
            .vsc-actions button::-moz-focus-inner {
                outline: none !important;
                border: none !important;
                box-shadow: none !important;
            }
            
            #vsc-cancel { background: transparent; color: var(--vsc-text); border: 1px solid var(--vsc-input-border) !important; }
            #vsc-cancel:hover { background: rgba(128, 128, 128, 0.1); }
            
            #vsc-save { background: #0078d4; color: white; }
            #vsc-save:hover { background: #0086ed; box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3) !important; }
            #vsc-save:active { background: #005a9e; }
        `);

        const wrapper = modal.querySelector('#protocol-select-wrapper');
        const trigger = modal.querySelector('.vsc-select-trigger');
        const optionsList = modal.querySelector('#vsc-options');
        const selectedText = modal.querySelector('#vsc-selected-text');
        const customInput = modal.querySelector('#protocol-custom');
        const saveBtn = modal.querySelector('#vsc-save');
        const cancelBtn = modal.querySelector('#vsc-cancel');

        let selectedValue = currentProtocol;
        const builtinProtocols = ['vscode', 'antigravity', 'windsurf', 'cursor', 'vscodium', 'vscode-insiders'];

        // 初始化显示
        function initSelect() {
            const isCustom = !builtinProtocols.includes(selectedValue);
            const actualValue = isCustom ? 'custom' : selectedValue;

            const option = modal.querySelector(`.vsc-option[data-value="${actualValue}"]`);
            if (option) {
                option.classList.add('selected');
                selectedText.textContent = option.textContent;
            }

            if (isCustom) {
                customInput.style.display = 'block';
                selectedValue = currentProtocol; // 保持自定义文本
            }
        }
        initSelect();

        // 切换下拉框
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            wrapper.classList.toggle('open');
        });

        // 选项点击
        modal.querySelectorAll('.vsc-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = opt.dataset.value;

                // UI 更新
                modal.querySelectorAll('.vsc-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                selectedText.textContent = opt.textContent;
                wrapper.classList.remove('open');

                // 逻辑更新
                if (val === 'custom') {
                    customInput.style.display = 'block';
                    customInput.focus();
                    selectedValue = customInput.value;
                } else {
                    customInput.style.display = 'none';
                    selectedValue = val;
                }
            });
        });

        // 点击外部关闭
        document.addEventListener('click', () => {
            wrapper.classList.remove('open');
        }, { once: false });

        saveBtn.addEventListener('click', () => {
            const finalValue = (modal.querySelector('.vsc-option.selected').dataset.value === 'custom')
                ? customInput.value.trim()
                : selectedValue;

            if (finalValue) {
                GM_setValue('vscode_protocol', finalValue);
                updateInstallLinks();
                closeModal();
            }
        });

        cancelBtn.addEventListener('click', closeModal);
        modal.querySelector('.vsc-modal-overlay').addEventListener('click', closeModal);

        function closeModal() {
            modal.remove();
        }
    }
})();
