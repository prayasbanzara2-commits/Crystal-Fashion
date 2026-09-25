(function () {
    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
        <div class="cookie-banner-content">
            <div class="cookie-banner-text">
                <strong>We value your privacy</strong>
                <p>We use cookies to improve your browsing experience, analyse site traffic and remember your preferences. Read our <a href="cookies.html">Cookie Policy</a>, <a href="privacy.html">Privacy Policy</a> and <a href="terms.html">Terms of Service</a> to learn more.</p>
            </div>
            <div class="cookie-banner-actions">
                <button class="cookie-btn cookie-btn-decline" type="button">Decline</button>
                <button class="cookie-btn cookie-btn-accept" type="button">Accept All</button>
            </div>
        </div>`;
    document.body.appendChild(banner);

    function hideBanner(choice) {
        try { localStorage.setItem('cf_cookie_consent', choice); } catch {}
        banner.classList.remove('show');
        setTimeout(() => { banner.style.display = 'none'; }, 600);
    }

    banner.querySelector('.cookie-btn-decline').addEventListener('click', () => hideBanner('declined'));
    banner.querySelector('.cookie-btn-accept').addEventListener('click', () => hideBanner('accepted'));

    try {
        if (localStorage.getItem('cf_cookie_consent')) return;
    } catch {}
    setTimeout(() => banner.classList.add('show'), 900);
})();
