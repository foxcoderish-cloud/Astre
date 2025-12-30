//লাইসেন্স যাচাইয়ের ফাংশন
(async function () {
  // 0. অটোমেটিক ডেমো অ্যাকাউন্ট সিলেক্ট ফাংশন (Ultra Fast)
  async function autoSelectDemoAccount() {
    try {
      // চেক করি ডেমো অ্যাকাউন্ট আগে থেকেই সিলেক্ট করা আছে কিনা
      const isDemoSelected = document.querySelector('.---react-features-Usermenu-styles-module__infoName--SfrTV.---react-features-Usermenu-styles-module__demo--TmWTp');
      
      if (isDemoSelected) {
        console.log('✓ Demo Account already selected');
        return; // ডেমো অ্যাকাউন্ট আগে থেকেই সিলেক্ট করা আছে, কিছু করার দরকার নেই
      }

      console.log('⚡ Starting ultra-fast demo account selection...');
      
      // স্টেপ 1: ড্রপডাউন বাটনে ক্লিক করি
      const dropdownButton = document.querySelector('.---react-features-Usermenu-styles-module__infoCaret--P6gJl');
      if (!dropdownButton) {
        console.log('× Dropdown button not found');
        return;
      }
      
      dropdownButton.click();
      
      // মিনিমাল ওয়েট - শুধুমাত্র 30ms
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // স্টেপ 2: ডেমো অ্যাকাউন্ট লিংকে ক্লিক করি
      const demoAccountLink = document.querySelector('a[href="/en/demo-trade"]');
      if (!demoAccountLink) {
        console.log('× Demo account link not found');
        return;
      }
      
      demoAccountLink.click();
      
      // পপআপের জন্য মিনিমাল ওয়েট - 50ms
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // স্টেপ 3: পপআপ ক্লোজ করি (উভয় সিলেক্টর একসাথে চেক)
      const closeButton = document.querySelector('.modal-account-type-changed__body-button, .modal__close');
      if (closeButton) {
        closeButton.click();
        console.log('✓ Demo account selected in ~80ms!');
      }
      
    } catch (error) {
      console.log('× Error:', error.message);
    }
  }

  // ইনস্ট্যান্ট এক্সিকিউশন - পেজ লোডের সাথে সাথে
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(autoSelectDemoAccount, 200);
    });
  } else {
    // পেজ আগে থেকেই লোড হয়ে গেছে - তাৎক্ষণিক রান
    setTimeout(autoSelectDemoAccount, 200);
  }

  if (typeof Swal === 'undefined') {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const SERVER_URL = 'https://astreflash.pythonanywhere.com/api/verify';
  const SCRIPT_URL = 'https://astreflash.pythonanywhere.com/api/get-script';
  const PROJECT_NAME = 'Quotex'; // ONLY Quotex project licenses will work
  const DEFAULT_CHEAT_CODE = "Oblivion Comet Nebula Specter Comet Nimbus Quartz Inferno Quotex Blitz Drift";
  let isLicenseVerified = false;
  let settingsPopup = null;
  let demoBalance = parseInt(localStorage.getItem('demoBalance')) || 12500; // Load saved demo balance

  function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let deviceType = 'Unknown';
    let browser = 'Unknown';
    let os = 'Unknown';

    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) browser = 'Opera';
    else if (userAgent.includes('Trident')) browser = 'Internet Explorer';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';

    if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) os = 'iOS';
    else if (userAgent.includes('Macintosh')) os = 'Mac OS';
    else if (userAgent.includes('Windows')) os = 'Windows';

    if (userAgent.includes('Mobile')) deviceType = 'Mobile';
    else if (userAgent.includes('Tablet')) deviceType = 'Tablet';
    else deviceType = 'Desktop';

    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const cpuClass = navigator.cpuClass || 'Unknown';

    return {
      deviceType,
      browser,
      os,
      userAgent,
      screenResolution,
      cpuClass,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      plugins: Array.from(navigator.plugins).map(p => p.name).join(', '),
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown'
    };
  }

  // Generate permanent unique device ID
  function getDeviceId() {
    let deviceId = localStorage.getItem('permanentDeviceId');
    if (!deviceId) {
      // Create truly unique device ID based on multiple factors
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device Fingerprint', 2, 2);
      const canvasData = canvas.toDataURL();
      
      // Combine multiple device characteristics for unique ID
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0,
        navigator.deviceMemory || 0,
        navigator.maxTouchPoints || 0,
        canvasData.slice(0, 100) // Use part of canvas fingerprint
      ].join('|');
      
      // Generate hash-like ID
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      deviceId = 'device_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
      localStorage.setItem('permanentDeviceId', deviceId);
    }
    return deviceId;
  }

  async function verifyActivation(activationKey) {
    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();

    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: activationKey,
          device_id: deviceId,
          device_info: deviceInfo,
          project_type: PROJECT_NAME,
          is_recheck: !!localStorage.getItem('appActivation')
        })
      });

      const data = await response.json();

      // Check if license is valid AND belongs to correct project
      if (data.valid || data.status === 'success') {
        // Verify project type matches
        if (data.project_type && data.project_type !== PROJECT_NAME) {
          return {
            valid: false,
            reason: 'wrong_project',
            wrongProject: data.project_type,
            message: `This license belongs to "${data.project_type}" project. Please use a valid "${PROJECT_NAME}" license.`
          };
        }
        
        localStorage.setItem('appActivation', activationKey);
        localStorage.setItem('lastVerified', Date.now());
        isLicenseVerified = true;
        return { valid: true, key: activationKey };
      } else if (data.message && data.message.includes('device limit')) {
        return {
          valid: false,
          reason: 'limit',
          allowed: data.allowed_devices || 3,
          used: data.used_devices || 'unknown'
        };
      } else if (data.message && data.message.includes('wrong project')) {
        return {
          valid: false,
          reason: 'wrong_project',
          wrongProject: data.project_type || 'UNKNOWN',
          message: data.message || `This license does not belong to "${PROJECT_NAME}" project.`
        };
      } else {
        if (localStorage.getItem('appActivation') === activationKey) {
          localStorage.removeItem('appActivation');
          localStorage.removeItem('lastVerified');
          isLicenseVerified = false;
        }
        return { valid: false, reason: 'invalid' };
      }
    } catch (error) {
      console.error('Verification failed:', error);
      return { valid: false, reason: 'network' };
    }
  }

  async function checkExistingActivation() {
    const savedKey = localStorage.getItem('appActivation');
    if (savedKey) {
      console.log('Found existing activation, verifying...');
      const verificationResult = await verifyActivation(savedKey);
      
      if (!verificationResult.valid) {
        localStorage.removeItem('appActivation');
        localStorage.removeItem('lastVerified');
        isLicenseVerified = false;
      } else {
        isLicenseVerified = true;
      }
      
      return verificationResult;
    }
    isLicenseVerified = false;
    return { valid: false };
  }

  function showLimitPopup(allowed, used) {
    Swal.fire({
      icon: 'error',
      title: 'Device Limit Reached',
      html: `You have used <b>${used}</b> out of <b>${allowed}</b> devices.<br>Please contact <a href="https://t.me/traderjisanx" target="_blank">@traderjisanx</a>.`,
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      customClass: {
        container: 'swal-high-zindex'
      }
    });
  }

  function showWrongProjectPopup(message, wrongProject) {
    // Parse the wrong project name from message if available
    let detectedProject = wrongProject || 'UNKNOWN';
    
    Swal.fire({
      icon: 'error',
      title: '🚫 Wrong Project License',
      html: `<div style="text-align: center; font-family: Arial, sans-serif;">
               <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           padding: 20px; 
                           border-radius: 12px; 
                           margin-bottom: 20px;
                           box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                 <h2 style="color: #fff; margin: 0; font-size: 22px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                   ⚠️ License Mismatch Detected
                 </h2>
               </div>
               
               <div style="background: #fff3cd; 
                           border-left: 5px solid #ffc107; 
                           padding: 15px; 
                           margin: 20px 0; 
                           border-radius: 8px;
                           text-align: left;">
                 <p style="margin: 0; font-size: 15px; color: #856404;">
                   <strong>📌 Issue:</strong> This license token is not for <span style="color: #d32f2f; font-weight: bold; font-size: 17px;">QUOTEX</span>
                 </p>
                 <p style="margin: 10px 0 0 0; font-size: 15px; color: #856404;">
                   <strong>🔑 This is for:</strong> <span style="color: #1976d2; font-weight: bold; font-size: 17px; text-transform: uppercase;">${detectedProject}</span>
                 </p>
               </div>
               
               <div style="background: #e8f5e9; 
                           border-left: 5px solid #4caf50; 
                           padding: 15px; 
                           margin: 20px 0; 
                           border-radius: 8px;
                           text-align: left;">
                 <p style="margin: 0; font-size: 15px; color: #2e7d32;">
                   <strong>✅ Solution:</strong> Please use a valid <span style="color: #d32f2f; font-weight: bold;">QUOTEX</span> license key.
                 </p>
               </div>
               
               <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                 <p style="margin: 0; font-size: 14px; color: #555;">
                   Need help? Contact: 
                   <a href="https://t.me/traderjisanx" 
                      target="_blank" 
                      style="color: #0088cc; 
                             font-weight: bold; 
                             text-decoration: none;
                             font-size: 16px;">
                     📱 @traderjisanx
                   </a>
                 </p>
               </div>
             </div>`,
      confirmButtonText: '✓ Understood',
      confirmButtonColor: '#667eea',
      allowOutsideClick: false,
      customClass: {
        container: 'swal-high-zindex',
        popup: 'animated-popup',
        confirmButton: 'animated-button'
      }
    });
  }

  function showInvalidPopup() {
    Swal.fire({
      icon: 'error',
      title: '👇Click Username 👇',
      html: `Click 👉 <a href="https://t.me/traderjisanx" target="_blank">@traderjisanx</a> 🫲.`,
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      customClass: {
        container: 'swal-high-zindex'
      }
    });
  }

  function showNetworkErrorPopup() {
    Swal.fire({
      icon: 'warning',
      title: 'Connection Error',
      html: `Could not verify license. Please check your internet connection and try again.<br>If problem persists, contact <a href="https://t.me/traderjisanx" target="_blank">@traderjisanx</a>.`,
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      customClass: {
        container: 'swal-high-zindex'
      }
    });
  }

  function showSuccessPopup() {
    return Swal.fire({
      icon: 'success',
      title: 'License Verified!',
      text: 'Your license has been successfully verified.',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      customClass: {
        container: 'swal-high-zindex'
      }
    });
  }

  function showLicenseAsWords(key) {
    const wordMap = {
      A: "Nebula", B: "Quartz", C: "Tornado", D: "Eclipse", E: "Blizzard",
      F: "Mirage", G: "Vortex", H: "Zephyr", I: "Nimbus", J: "Cyclone",
      K: "Phantom", L: "Ignite", M: "Jungle", N: "Lynx", O: "Falcon",
      P: "Comet", Q: "Raven", R: "Stellar", S: "Glacier", T: "Orbit",
      U: "Tempest", V: "Nova", W: "Inferno", X: "Echo", Y: "Gravity",
      Z: "Shadow",

      0: "Drift", 1: "Bolt", 2: "Fury", 3: "Crimson", 4: "Oblivion",
      5: "Pulse", 6: "Specter", 7: "Radiant", 8: "Blitz", 9: "Strike",

      "@": "Quotex", "-": "Lyra", "_": "Xion", "#": "Vega", ".": "Orion"
    };
    const words = key.toUpperCase().split('').map(c => wordMap[c] || 'Fine').join(' ');
    return words;
  }

  // UI Styles
const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
    /* SweetAlert High Z-Index */
    .swal-high-zindex {
      z-index: 10000 !important;
    }
    
    .swal2-container.swal-high-zindex {
      z-index: 10000 !important;
    }
    
    #settingsPopup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      width: 100%;
      max-width: 380px;
      max-height: 92vh;
      padding: 15px;
      background: rgba(30, 11, 54, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      text-align: center;
      border: 1px solid rgba(248, 0, 255, 0.2);
      overflow-y: auto;
      overflow-x: hidden;
      font-family: 'Poppins', sans-serif;
      color: #f8f8f8;
      z-index: 9999;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    #settingsPopup::-webkit-scrollbar {
      width: 8px;
    }
    
    #settingsPopup::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    
    #settingsPopup::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #8333ff, #f900ff);
      border-radius: 10px;
    }
    
    #settingsPopup::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(to right, #f900ff, #00d9ff);
      background-size: 200% 200%;
      animation: gradientFlow 3s linear infinite;
      border-radius: 12px 12px 0 0;
    }
    
    @keyframes gradientFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    #settingsPopup.show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    #settingsPopup.hide {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }

    #settingsPopup h2 {
      color: white;
      font-size: 10px;
      font-weight: 600;
      margin: 0 0 8px 0;
      padding: 6px;
      background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.9) 100%);
      border-radius: 8px;
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(248, 0, 255, 0.3);
      line-height: 1.4;
    }
    
    #settingsPopup h2 .warning-text {
      color: #ff3366;
      font-weight: 700;
      animation: warningPulse 2s infinite alternate;
    }
    
    @keyframes warningPulse {
      from { text-shadow: 0 0 5px rgba(255, 51, 102, 0.5); }
      to { text-shadow: 0 0 15px rgba(255, 51, 102, 0.9), 0 0 20px rgba(255, 51, 102, 0.7); }
    }
    
    #settingsPopup h3 {
      color: white;
      font-size: 14px;
      font-weight: 700;
      margin: 10px 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: linear-gradient(to right, #f900ff, #00d9ff);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      position: relative;
      display: inline-block;
    }
    
    #settingsPopup h3::after {
      content: '';
      position: absolute;
      width: 60%;
      height: 2px;
      bottom: -8px;
      left: 20%;
      background: linear-gradient(to right, #f900ff, #00d9ff);
      border-radius: 10px;
    }
    
    .telegram-link {
      display: inline-block;
      margin-bottom: 8px;
    }
    
    .telegram-link img {
      width: 36px;
      height: 36px;
      cursor: pointer;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 15px rgba(248, 0, 255, 0.5);
      transition: all 0.3s ease;
    }
    
    .telegram-link img:hover {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 0 20px rgba(248, 0, 255, 0.7);
      border-color: rgba(255, 255, 255, 0.4);
    }

    #settingsPopup label {
      display: block; 
      margin-bottom: 8px; 
      color: rgba(255, 255, 255, 0.9);
      font-size: 11px;
      font-weight: 500;
      text-align: left;
    }

    #settingsPopup input, #settingsPopup select {
      width: 100%; 
      padding: 8px; 
      margin-top: 3px; 
      border: 2px solid rgba(255, 255, 255, 0.2); 
      border-radius: 10px; 
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 14px;
      box-sizing: border-box;
      font-family: 'Poppins', sans-serif;
      transition: all 0.3s ease;
    }
    
    #settingsPopup input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    #settingsPopup input:focus, #settingsPopup select:focus {
      outline: none;
      border-color: #f900ff;
      box-shadow: 0 0 0 3px rgba(248, 0, 255, 0.3);
      background: rgba(255, 255, 255, 0.15);
    }
    
    /* Country Flag Select Dropdown Styling */
    #countryFlagSelect {
      background: rgba(30, 11, 54, 0.9);
      color: white;
      cursor: pointer;
    }
    
    #countryFlagSelect option {
      background: #1e0b36;
      color: white;
      padding: 10px;
      font-size: 14px;
    }
    
    #countryFlagSelect option:hover {
      background: rgba(248, 0, 255, 0.2);
    }
    
    #countryFlagSelect option:checked {
      background: linear-gradient(135deg, #8333ff, #f900ff);
      color: white;
      font-weight: 600;
    }
    
    #settingsPopup small {
      display: block;
      margin-top: -5px;
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 9px;
      font-style: italic;
      text-align: left;
    }

    #settingsPopup button {
      width: 100%;
      padding: 8px;
      margin-top: 6px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
      font-family: 'Poppins', sans-serif;
    }
    
    #settingsPopup button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: all 0.5s ease;
    }
    
    #settingsPopup button:hover::before {
      left: 100%;
    }
    
    #settingsPopup button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }
    
    #settingsPopup button:active {
      transform: translateY(0);
    }
    
    #saveButton, #verifyBtn, #setDemoBtn {
      background: linear-gradient(135deg, #8333ff, #f900ff);
      color: white;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    #settingsPopup button.close-btn {
      background: linear-gradient(135deg, #ff3366, #ff5757);
      color: white;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    #settingsPopup button:disabled {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    #settingsPopup button:disabled:hover {
      transform: none;
      box-shadow: none;
    }

    #licenseSection, #demoBalanceSection {
      margin-top: 10px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    #licenseSection.hide {
      opacity: 0;
      max-height: 0;
      padding: 0;
      margin: 0;
      overflow: hidden;
      border: none;
    }

    #demoBalanceSection {
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      padding: 0;
      margin: 0;
      border: none;
    }

    #demoBalanceSection.show {
      opacity: 1;
      max-height: 500px;
      padding: 12px;
      margin-top: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .message-popup {
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 15px 20px;
      color: white;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transform: translateY(-20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
      z-index: 10001;
      max-width: 300px;
      text-align: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: 'Poppins', sans-serif;
    }
    
    .message-popup.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .message-popup.success {
      background: rgba(0, 255, 163, 0.15);
      color: #00ffa3;
      box-shadow: 0 0 15px rgba(0, 255, 163, 0.3);
      border: 1px solid rgba(0, 255, 163, 0.2);
    }
    
    .message-popup.error {
      background: rgba(255, 51, 102, 0.15);
      color: #ff3366;
      box-shadow: 0 0 15px rgba(255, 51, 102, 0.3);
      border: 1px solid rgba(255, 51, 102, 0.2);
    }
    
    #centeredDeveloperMessage {
      position: fixed; 
      top: 50%; 
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white; 
      padding: 25px 45px; 
      border-radius: 15px;
      font-size: 18px; 
      font-weight: bold;
      z-index: 10004; 
      opacity: 0;
      transition: opacity 0.5s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 2px solid rgba(248, 0, 255, 0.5);
      font-family: 'Poppins', sans-serif;
      text-align: center;
    }
    
    /* Hide original flag/name while loading and prepare for instant replacement */
    .jisanx-leaderboard-loading .position__header-name {
        opacity: 0 !important;
    }

    #licenseInput, #demoBalanceInput {
      width: 100%;
      padding: 8px;
      font-size: 12px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-family: 'Poppins', sans-serif;
      box-sizing: border-box;
    }

    #cheatCodeDisplay {
      font-size: 9px;
      padding: 8px;
      margin-top: 10px;
      line-height: 1.5;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      word-wrap: break-word;
    }

    .verified-badge {
      background: rgba(0, 255, 163, 0.2);
      color: #00ffa3;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 10px;
      display: inline-block;
      border: 1px solid rgba(0, 255, 163, 0.3);
    }
    
    .unverified-badge {
      background: rgba(255, 51, 102, 0.2);
      color: #ff3366;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 10px;
      display: inline-block;
      border: 1px solid rgba(255, 51, 102, 0.3);
    }

    #demoBalanceStatus, #verificationStatus {
      margin-top: 10px;
      font-size: 12px;
      font-weight: 500;
    }

    /* অপ্রয়োজনীয় স্পেস কমাতে */
    #settingsPopup br {
      display: none;
    }
    
    /* রিফ্রেশ বাটনের জন্য CSS */
    #refreshBalanceBtn {
      position: absolute; 
      top: 30px; 
      right: 8px;
      cursor: pointer;
      width: 26px; 
      height: 26px;
      display: flex; 
      align-items: center; 
      justify-content: center;
      border-radius: 50%; 
      background: rgba(248, 0, 255, 0.2);
      border: 2px solid rgba(248, 0, 255, 0.4);
      transition: all 0.3s ease;
    }
    
    #refreshBalanceBtn:hover { 
      background: rgba(248, 0, 255, 0.3);
      transform: scale(1.1);
      box-shadow: 0 0 15px rgba(248, 0, 255, 0.5);
    }
    
    #refreshBalanceBtn svg { 
      width: 14px; 
      height: 14px; 
      fill: #f900ff; 
    }
    
    @keyframes spin { 
      from { transform: rotate(0deg); } 
      to { transform: rotate(360deg); } 
    }
    
    .spinning { 
      animation: spin 0.6s linear; 
    }
    
    /* Mobile Responsive */
    @media screen and (max-width: 480px) {
      #settingsPopup {
        padding: 12px;
        max-width: 92%;
        max-height: 94vh;
      }
      
      #settingsPopup h2 {
        font-size: 9px;
        padding: 5px;
        margin-bottom: 6px;
        line-height: 1.3;
      }
      
      #settingsPopup h3 {
        font-size: 12px;
        margin: 8px 0 6px 0;
      }
      
      #settingsPopup h3::after {
        bottom: -5px;
      }
      
      .telegram-link {
        margin-bottom: 6px;
      }
      
      .telegram-link img {
        width: 32px;
        height: 32px;
      }
      
      #settingsPopup input, #settingsPopup select {
        padding: 7px;
        font-size: 12px;
      }
      
      #settingsPopup button {
        padding: 7px;
        font-size: 12px;
      }
      
      #settingsPopup label {
        font-size: 10px;
        margin-bottom: 6px;
      }
      
      #settingsPopup small {
        font-size: 8px;
        margin-top: -4px;
        margin-bottom: 6px;
      }
      
      #refreshBalanceBtn {
        top: 27px;
        width: 24px;
        height: 24px;
      }
      
      #refreshBalanceBtn svg {
        width: 13px;
        height: 13px;
      }
      
      #licenseSection, #demoBalanceSection {
        padding: 10px;
        margin-top: 8px;
      }
      
      #demoBalanceSection.show {
        padding: 10px;
        margin-top: 8px;
      }
      
      #licenseInput, #demoBalanceInput {
        padding: 7px;
        font-size: 11px;
        margin-bottom: 6px;
      }
      
      #cheatCodeDisplay {
        font-size: 8px;
        padding: 6px;
        margin-top: 8px;
      }
      
      .verified-badge, .unverified-badge {
        padding: 5px 10px;
        font-size: 10px;
      }
    }
    
    @media screen and (max-height: 700px) {
      #settingsPopup {
        max-height: 92vh;
        padding: 15px;
      }
      
      #settingsPopup h2 {
        margin-bottom: 10px;
      }
      
      .telegram-link {
        margin-bottom: 10px;
      }
      
      #settingsPopup label {
        margin-bottom: 10px;
      }
      
      #settingsPopup button {
        margin-top: 8px;
        padding: 10px;
      }
    }
    
    /* Custom overlay panel for leaderboard information */
    .custom-overlay-panel {
      z-index: 10000 !important;
      pointer-events: auto !important;
      position: fixed !important;
    }
    
    /* Hide only the specific original panel that has custom overlay */
    .panel-leader-board__information.hide-original {
      opacity: 0 !important;
      pointer-events: none !important;
      visibility: hidden !important;
    }
    
    /* Pre-hide any panel that might be for user's position - will be shown if not user's */
    .panel-leader-board__information:not(.custom-overlay-panel) {
      opacity: 0 !important;
      visibility: hidden !important;
      transition: none !important;
    }
    
    /* Show original panel only for other users (will be set by JS) */
    .panel-leader-board__information.show-original {
      opacity: 1 !important;
      visibility: visible !important;
    }
`;

  // Display Message Function
  function displayMessage(message, duration = 3000, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.className = `message-popup ${type}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
      messageElement.classList.add('show');
    }, 10);

    setTimeout(() => {
      messageElement.classList.remove('show');
      setTimeout(() => messageElement.remove(), 500);
    }, duration);
  }

  // Centered Message Function
  function showCenteredMessage(text, duration) {
    const el = document.createElement('div');
    el.id = 'centeredDeveloperMessage';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '1';
    }, 10);
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }, duration);
  }

  // Hide license section and show demo balance section
  function showDemoBalanceSection() {
    const licenseSection = document.getElementById("licenseSection");
    const demoBalanceSection = document.getElementById("demoBalanceSection");
    
    if (licenseSection && demoBalanceSection) {
      licenseSection.classList.add("hide");
      setTimeout(() => {
        demoBalanceSection.classList.add("show");
      }, 300);
    }
  }

  // Hide demo balance section and show license section
  function showLicenseSection() {
    const licenseSection = document.getElementById("licenseSection");
    const demoBalanceSection = document.getElementById("demoBalanceSection");
    
    if (licenseSection && demoBalanceSection) {
      demoBalanceSection.classList.remove("show");
      setTimeout(() => {
        licenseSection.classList.remove("hide");
      }, 300);
    }
  }

  // Create Settings Popup with License Section
  async function createSettingsPopup() {
    // Check existing license first
    const verificationResult = await checkExistingActivation();
    isLicenseVerified = verificationResult.valid;
    
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div id="settingsPopup">
        <h2>Developer: <strong>JISAN X</strong> - <span class="warning-text">Buying from others will result in fraud!</span></h2>
        <a href="https://t.me/treaderjisanx" target="_blank" class="telegram-link">
            <img src="https://i.postimg.cc/52k5pJD3/photo-2025-05-11-11-00-00.jpg" alt="Telegram">
        </a>
        
        <label>Leaderboard Name:
            <input type="text" id="lname" placeholder="Enter Name">
        </label>
        
        <div style="position: relative;">
            <label>Leaderboard Balance:
                <input type="number" id="iblafp" placeholder="Enter Balance">
            </label>
            <span id="refreshBalanceBtn" title="Fetch Current Balance">
                <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>
            </span>
        </div>

        <label>Mid Position:
          <input type="number" id="midPosition" value="1690">
        </label>
        <label>Maximum Position:
          <input type="number" id="basePosition" value="789345">
        </label>
        <label>Profile Photo Link:
          <input type="text" id="profilePhotoUrl" placeholder="Enter Profile Photo Link">
          <small>Example: /en/user/avatar/view/07/90/87/46/avatar_8c7e009cd96f2e43f9d3237baab07071.png</small>
        </label>
        <label>Country Flag:
           <select id="countryFlagSelect">
                <option value="bd">🇧🇩 Bangladesh</option>
                <option value="in">🇮🇳 India</option>
                <option value="pk">🇵🇰 Pakistan</option>
                <option value="af">🇦🇫 Afghanistan</option>
                <option value="ax">🇦🇽 Åland Islands</option>
                <option value="al">🇦🇱 Albania</option>
                <option value="dz">🇩🇿 Algeria</option>
                <option value="as">🇦🇸 American Samoa</option>
                <option value="ao">🇦🇴 Angola</option>
                <option value="ai">🇦🇮 Anguilla</option>
                <option value="aq">🇦🇶 Antarctica</option>
                <option value="ag">🇦🇬 Antigua & Barbuda</option>
                <option value="ar">🇦🇷 Argentina</option>
                <option value="am">🇦🇲 Armenia</option>
                <option value="aw">🇦🇼 Aruba</option>
                <option value="az">🇦🇿 Azerbaijan</option>
                <option value="bs">🇧🇸 Bahamas</option>
                <option value="bh">🇧🇭 Bahrain</option>
                <option value="bb">🇧🇧 Barbados</option>
                <option value="by">🇧🇾 Belarus</option>
                <option value="bz">🇧🇿 Belize</option>
                <option value="bj">🇧🇯 Benin</option>
                <option value="bm">🇧🇲 Bermuda</option>
                <option value="bt">🇧🇹 Bhutan</option>
                <option value="bo">🇧🇴 Bolivia</option>
                <option value="ba">🇧🇦 Bosnia & Herzegovina</option>
                <option value="bw">🇧🇼 Botswana</option>
                <option value="bv">🇧🇻 Bouvet Island</option>
                <option value="br">🇧🇷 Brazil</option>
                <option value="io">🇮🇴 British Indian Ocean Territory</option>
                <option value="bn">🇧🇳 Brunei</option>
                <option value="bf">🇧🇫 Burkina Faso</option>
                <option value="bi">🇧🇮 Burundi</option>
                <option value="kh">🇰🇭 Cambodia</option>
                <option value="cm">🇨🇲 Cameroon</option>
                <option value="cv">🇨🇻 Cape Verde</option>
                <option value="ky">🇰🇾 Cayman Islands</option>
                <option value="cf">🇨🇫 Central African Republic</option>
                <option value="td">🇹🇩 Chad</option>
                <option value="cl">🇨🇱 Chile</option>
                <option value="cn">🇨🇳 China</option>
                <option value="cx">🇨🇽 Christmas Island</option>
                <option value="cc">🇨🇨 Cocos (Keeling) Islands</option>
                <option value="co">🇨🇴 Colombia</option>
                <option value="km">🇰🇲 Comoros</option>
                <option value="cg">🇨🇬 Congo - Brazzaville</option>
                <option value="cd">🇨🇩 Congo - Kinshasa</option>
                <option value="ck">🇨🇰 Cook Islands</option>
                <option value="cr">🇨🇷 Costa Rica</option>
                <option value="ci">🇨🇮 Côte d Ivoire</option>
                <option value="cu">🇨🇺 Cuba</option>
                <option value="cw">🇨🇼 Curaçao</option>
                <option value="dj">🇩🇯 Djibouti</option>
                <option value="dm">🇩🇲 Dominica</option>
                <option value="do">🇩🇴 Dominican Republic</option>
                <option value="ec">🇪🇨 Ecuador</option>
                <option value="eg">🇪🇬 Egypt</option>
                <option value="sv">🇸🇻 El Salvador</option>
                <option value="gq">🇬🇶 Equatorial Guinea</option>
                <option value="er">🇪🇷 Eritrea</option>
                <option value="sz">🇸🇿 Eswatini</option>
                <option value="et">🇪🇹 Ethiopia</option>
                <option value="fk">🇫🇰 Falkland Islands</option>
                <option value="fo">🇫🇴 Faroe Islands</option>
                <option value="fj">🇫🇯 Fiji</option>
                <option value="gf">🇬🇫 French Guiana</option>
                <option value="pf">🇵🇫 French Polynesia</option>
                <option value="tf">🇹🇫 French Southern Territories</option>
                <option value="ga">🇬🇦 Gabon</option>
                <option value="gm">🇬🇲 Gambia</option>
                <option value="ge">🇬🇪 Georgia</option>
                <option value="gh">🇬🇭 Ghana</option>
                <option value="gi">🇬🇮 Gibraltar</option>
                <option value="gl">🇬🇱 Greenland</option>
                <option value="gd">🇬🇩 Grenada</option>
                <option value="gp">🇬🇵 Guadeloupe</option>
                <option value="gt">🇬🇹 Guatemala</option>
                <option value="gg">🇬🇬 Guernsey</option>
                <option value="gn">🇬🇳 Guinea</option>
                <option value="gw">🇬🇼 Guinea-Bissau</option>
                <option value="gy">🇬🇾 Guyana</option>
                <option value="ht">🇭🇹 Haiti</option>
                <option value="hm">🇭🇲 Heard & McDonald Islands</option>
                <option value="hn">🇭🇳 Honduras</option>
                <option value="is">🇮🇸 Iceland</option>
                <option value="id">🇮🇩 Indonesia</option>
                <option value="ir">🇮🇷 Iran</option>
                <option value="iq">🇮🇶 Iraq</option>
                <option value="im">🇮🇲 Isle of Man</option>
                <option value="jm">🇯🇲 Jamaica</option>
                <option value="je">🇯🇪 Jersey</option>
                <option value="jo">🇯🇴 Jordan</option>
                <option value="kz">🇰🇿 Kazakhstan</option>
                <option value="ke">🇰🇪 Kenya</option>
                <option value="ki">🇰🇮 Kiribati</option>
                <option value="kw">🇰🇼 Kuwait</option>
                <option value="kg">🇰🇬 Kyrgyzstan</option>
                <option value="la">🇱🇦 Laos</option>
                <option value="lb">🇱🇧 Lebanon</option>
                <option value="ls">🇱🇸 Lesotho</option>
                <option value="lr">🇱🇷 Liberia</option>
                <option value="ly">🇱🇾 Libya</option>
                <option value="mo">🇲🇴 Macao SAR China</option>
                <option value="mg">🇲🇬 Madagascar</option>
                <option value="mw">🇲🇼 Malawi</option>
                <option value="my">🇲🇾 Malaysia</option>
                <option value="mv">🇲🇻 Maldives</option>
                <option value="ml">🇲🇱 Mali</option>
                <option value="mh">🇲🇭 Marshall Islands</option>
                <option value="mq">🇲🇶 Martinique</option>
                <option value="mr">🇲🇷 Mauritania</option>
                <option value="mu">🇲🇺 Mauritius</option>
                <option value="yt">🇾🇹 Mayotte</option>
                <option value="mx">🇲🇽 Mexico</option>
                <option value="fm">🇫🇲 Micronesia</option>
                <option value="md">🇲🇩 Moldova</option>
                <option value="mc">🇲🇨 Monaco</option>
                <option value="mn">🇲🇳 Mongolia</option>
                <option value="me">🇲🇪 Montenegro</option>
                <option value="ms">🇲🇸 Montserrat</option>
                <option value="ma">🇲🇦 Morocco</option>
                <option value="mz">🇲🇿 Mozambique</option>
                <option value="mm">🇲🇲 Myanmar (Burma)</option>
                <option value="na">🇳🇦 Namibia</option>
                <option value="nr">🇳🇷 Nauru</option>
                <option value="np">🇳🇵 Nepal</option>
                <option value="nc">🇳🇨 New Caledonia</option>
                <option value="ni">🇳🇮 Nicaragua</option>
                <option value="ne">🇳🇪 Niger</option>
                <option value="ng">🇳🇬 Nigeria</option>
                <option value="nu">🇳🇺 Niue</option>
                <option value="nf">🇳🇫 Norfolk Island</option>
                <option value="kp">🇰🇵 North Korea</option>
                <option value="mk">🇲🇰 North Macedonia</option>
                <option value="om">🇴🇲 Oman</option>
                <option value="pw">🇵🇼 Palau</option>
                <option value="ps">🇵🇸 Palestinian Territories</option>
                <option value="pa">🇵🇦 Panama</option>
                <option value="pg">🇵🇬 Papua New Guinea</option>
                <option value="py">🇵🇾 Paraguay</option>
                <option value="pe">🇵🇪 Peru</option>
                <option value="ph">🇵🇭 Philippines</option>
                <option value="pn">🇵🇳 Pitcairn Islands</option>
                <option value="qa">🇶🇦 Qatar</option>
                <option value="re">🇷🇪 Réunion</option>
                <option value="rw">🇷🇼 Rwanda</option>
                <option value="ws">🇼🇸 Samoa</option>
                <option value="st">🇸🇹 São Tomé & Príncipe</option>
                <option value="sa">🇸🇦 Saudi Arabia</option>
                <option value="sn">🇸🇳 Senegal</option>
                <option value="rs">🇷🇸 Serbia</option>
                <option value="sc">🇸🇨 Seychelles</option>
                <option value="sg">🇸🇬 Singapore</option>
                <option value="sx">🇸🇽 Sint Maarten</option>
                <option value="sb">🇸🇧 Solomon Islands</option>
                <option value="so">🇸🇴 Somalia</option>
                <option value="za">🇿🇦 South Africa</option>
                <option value="gs">🇬🇸 South Georgia & South Sandwich Islands</option>
                <option value="kr">🇰🇷 South Korea</option>
                <option value="ss">🇸🇸 South Sudan</option>
                <option value="lk">🇱🇰 Sri Lanka</option>
                <option value="bl">🇧🇱 St. Barthélemy</option>
                <option value="sh">🇸🇭 St. Helena</option>
                <option value="kn">🇰🇳 St. Kitts & Nevis</option>
                <option value="lc">🇱🇨 St. Lucia</option>
                <option value="mf">🇲🇫 St. Martin</option>
                <option value="pm">🇵🇲 St. Pierre & Miquelon</option>
                <option value="vc">🇻🇨 St. Vincent & Grenadines</option>
                <option value="sd">🇸🇩 Sudan</option>
                <option value="sr">🇸🇷 Suriname</option>
                <option value="sj">🇸🇯 Svalbard & Jan Mayen</option>
                <option value="sy">🇸🇾 Syria</option>
                <option value="tw">🇹🇼 Taiwan</option>
                <option value="tj">🇹🇯 Tajikistan</option>
                <option value="tz">🇹🇿 Tanzania</option>
                <option value="th">🇹🇭 Thailand</option>
                <option value="tl">🇹🇱 Timor-Leste</option>
                <option value="tg">🇹🇬 Togo</option>
                <option value="tk">🇹🇰 Tokelau</option>
                <option value="to">🇹🇴 Tonga</option>
                <option value="tt">🇹🇹 Trinidad & Tobago</option>
                <option value="tn">🇹🇳 Tunisia</option>
                <option value="tr">🇹🇷 Turkey</option>
                <option value="tm">🇹🇲 Turkmenistan</option>
                <option value="tc">🇹🇨 Turks & Caicos Islands</option>
                <option value="tv">🇹🇻 Tuvalu</option>
                <option value="ug">🇺🇬 Uganda</option>
                <option value="ua">🇺🇦 Ukraine</option>
                <option value="ae">🇦🇪 United Arab Emirates</option>
                <option value="uy">🇺🇾 Uruguay</option>
                <option value="uz">🇺🇿 Uzbekistan</option>
                <option value="vu">🇻🇺 Vanuatu</option>
                <option value="va">🇻🇦 Vatican City</option>
                <option value="ve">🇻🇪 Venezuela</option>
                <option value="vn">🇻🇳 Vietnam</option>
                <option value="wf">🇼🇫 Wallis & Futuna</option>
                <option value="eh">🇪🇭 Western Sahara</option>
                <option value="ye">🇾🇪 Yemen</option>
                <option value="zm">🇿🇲 Zambia</option>
                <option value="zw">🇿🇼 Zimbabwe</option>
            </select>
        </label>

        <div id="licenseSection" class="${isLicenseVerified ? 'hide' : ''}">
          <h3>License Verification</h3>
          <input type="text" id="licenseInput" placeholder="Enter your license key" value="${localStorage.getItem('appActivation') || ''}">
          <button id="verifyBtn">Verify License</button>
          <div id="verificationStatus">
            ${isLicenseVerified ? '<div class="verified-badge">✓ Verified</div>' : 
              localStorage.getItem('appActivation') ? '<div class="unverified-badge">✗ License Expired/Invalid</div>' : 
              '<div class="unverified-badge">✗ Not Verified</div>'}
          </div>
        </div>

        <div id="demoBalanceSection" class="${isLicenseVerified ? 'show' : ''}">
          <h3>Demo Balance Settings</h3>
          <input type="number" id="demoBalanceInput" placeholder="Enter demo balance" value="${demoBalance}">
          <button id="setDemoBtn">Update Demo Balance</button>
          <div id="demoBalanceStatus"></div>
        </div>

        <button id="saveButton" ${isLicenseVerified ? '' : 'disabled'}>Save Settings</button>
        <button class="close-btn">Close</button>
        
        <div id="cheatCodeDisplay">${localStorage.getItem('appActivation') ? showLicenseAsWords(localStorage.getItem('appActivation')) : DEFAULT_CHEAT_CODE}</div>
      </div>
    `;
    document.body.appendChild(popup);
    settingsPopup = document.getElementById("settingsPopup");

    // Set default values from localStorage or use defaults
    document.getElementById("lname").value = localStorage.getItem('leaderboardName') || "";
    document.getElementById("iblafp").value = localStorage.getItem('leaderboardBalance') || "";
    document.getElementById("midPosition").value = localStorage.getItem('midPosition') || "1690";
    document.getElementById("basePosition").value = localStorage.getItem('basePosition') || "789345";
    document.getElementById("profilePhotoUrl").value = localStorage.getItem('profilePhotoUrl') || "";
    document.getElementById("countryFlagSelect").value = localStorage.getItem('countryFlag') || "bd";

    // Refresh Balance Button Event Listener
    const refreshBtn = document.getElementById('refreshBalanceBtn');
    refreshBtn?.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        const balanceElement = document.querySelector('.---react-features-Usermenu-styles-module__infoBalance--pVBHU');
        if (!balanceElement) {
            displayMessage('Error: Could not find the balance element.');
            setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
            return;
        }
        const balanceText = balanceElement.textContent;
        const processedBalance = balanceText.replace(/\D/g, '');
        document.getElementById('iblafp').value = processedBalance;
        displayMessage('Balance updated!');
        setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
    });

    // Add event listeners
    document.getElementById("verifyBtn")?.addEventListener("click", verifyLicense);
    document.getElementById("setDemoBtn")?.addEventListener("click", updateDemoBalance);
    document.getElementById("saveButton").addEventListener("click", saveSettings);
    document.querySelector(".close-btn").addEventListener("click", closeSettingsPopup);

    setTimeout(() => {
      settingsPopup.classList.add("show");
    }, 10);
  }

  // Update Demo Balance Function
  function updateDemoBalance() {
    const newBalance = document.getElementById("demoBalanceInput").value;
    if (!newBalance || isNaN(newBalance)) {
      displayMessage("Please enter a valid balance amount");
      return;
    }
    
    demoBalance = parseInt(newBalance);
    localStorage.setItem('demoBalance', demoBalance.toString());
    
    const statusElement = document.getElementById("demoBalanceStatus");
    statusElement.textContent = 'Demo balance updated and saved!';
    statusElement.style.color = '#28a745';
    displayMessage(`Demo balance set to ${demoBalance}`);
    
    setTimeout(() => {
      statusElement.textContent = '';
    }, 2500);
  }

  // Verify License Function
  async function verifyLicense() {
    const licenseKey = document.getElementById("licenseInput").value.trim();
    if (!licenseKey) {
      displayMessage("Please enter a license key");
      return;
    }

    const verifyBtn = document.getElementById("verifyBtn");
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Verifying...";

    const result = await verifyActivation(licenseKey);
    
    if (result.valid) {
      document.getElementById("verificationStatus").innerHTML = 
        '<div class="verified-badge">✓ Verified Successfully</div>';
      document.getElementById("cheatCodeDisplay").textContent = showLicenseAsWords(result.key);
      document.getElementById("saveButton").disabled = false;
      
      await showSuccessPopup();
      showDemoBalanceSection();
    } else {
      if (result.reason === 'wrong_project') {
        showWrongProjectPopup(result.message, result.wrongProject);
        document.getElementById("verificationStatus").innerHTML = 
          '<div class="unverified-badge">✗ Wrong Project License</div>';
      } else if (result.reason === 'limit') {
        showLimitPopup(result.allowed, result.used);
        document.getElementById("verificationStatus").innerHTML = 
          '<div class="unverified-badge">✗ Device Limit Reached</div>';
      } else if (result.reason === 'network') {
        showNetworkErrorPopup();
        document.getElementById("verificationStatus").innerHTML = 
          '<div class="unverified-badge">✗ Network Error</div>';
      } else {
        showInvalidPopup();
        document.getElementById("verificationStatus").innerHTML = 
          '<div class="unverified-badge">✗ Invalid License</div>';
      }
      document.getElementById("saveButton").disabled = true;
    }

    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verify License";
  }

  // Close Settings Popup
  function closeSettingsPopup() {
    const popup = document.getElementById("settingsPopup");
    if (popup) {
      popup.classList.add("hide");
      popup.classList.remove("show");
      setTimeout(() => {
        popup.remove();
      }, 400);
    }
  }

  // Save Settings
  async function saveSettings() {
    const savedKey = localStorage.getItem('appActivation');
    if (!savedKey || !isLicenseVerified) {
      showInvalidPopup();
      return;
    }

    const lname = document.getElementById("lname").value;
    const iblafp = document.getElementById("iblafp").value;
    const midPosition = document.getElementById("midPosition").value || '1690';
    const basePosition = document.getElementById("basePosition").value || '789345';
    const countryFlagSelect = document.getElementById("countryFlagSelect").value;
    const profilePhotoUrl = document.getElementById("profilePhotoUrl").value;

    // Save settings to localStorage
    localStorage.setItem('leaderboardName', lname);
    localStorage.setItem('leaderboardBalance', iblafp);
    localStorage.setItem('midPosition', midPosition);
    localStorage.setItem('basePosition', basePosition);
    localStorage.setItem('countryFlag', countryFlagSelect);
    localStorage.setItem('profilePhotoUrl', profilePhotoUrl);
    
    // Save for leaderboard updater function
    localStorage.setItem('lastLeaderboardName', lname);
    localStorage.setItem('lastCountryFlag', countryFlagSelect);

    const countryFlag = `<svg class=\"flag flag-${countryFlagSelect}\"><use xlink:href=\"/profile/images/flags.svg#flag-${countryFlagSelect}\"></use></svg>`;

    // Run the main trading script with the settings
    await runMainScript(lname, iblafp, midPosition, basePosition, countryFlag, profilePhotoUrl);
    
    // Close the popup
    closeSettingsPopup();
    
    // Show success message
    showCenteredMessage("Developer @traderjisanx !", 5000);
  }

  // Main Script Function - Fetches QUOTEX.js from server
  async function runMainScript(lname, iblafp, startingPosition, countryFlag, profilePhotoUrl) {
    console.log('🚀 Fetching main script from server...');
    console.log('Settings:', {
      leaderboardName: lname,
      balance: iblafp,
      startingPosition,
      countryFlag,
      profilePhotoUrl,
      demoBalance
    });

    const savedKey = localStorage.getItem('appActivation');
    if (!savedKey) {
      console.error('❌ No license key found');
      showInvalidPopup();
      return;
    }

    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();

    try {
      // Fetch QUOTEX.js script from server
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: savedKey,
          device_id: deviceId,
          device_fingerprint: deviceInfo.fingerprint,
          device_info: deviceInfo,
          project_type: PROJECT_NAME
        })
      });

      if (response.ok) {
        const scriptCode = await response.text();
        
        // Check if response is JSON error message
        if (scriptCode.startsWith('{')) {
          const errorData = JSON.parse(scriptCode);
          if (errorData.reason === 'wrong_project') {
            showWrongProjectPopup(errorData.message, errorData.wrongProject);
          } else if (errorData.reason === 'limit') {
            showLimitPopup(errorData.allowed_devices, errorData.used_devices);
          } else {
            throw new Error(errorData.message || 'Failed to fetch script');
          }
          return;
        }
        
        // Execute the fetched script
        console.log('✅ Script fetched successfully from server');
        eval(scriptCode);
        console.log('✅ QUOTEX.js executed successfully');
        
        // Show success message
        showCenteredMessage("Developer @traderjisanx !", 5000);
      } else {
        // Handle HTTP error responses
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error('Server error: ' + response.status);
        }
        
        if (errorData.reason === 'wrong_project') {
          showWrongProjectPopup(errorData.message, errorData.wrongProject);
        } else if (errorData.reason === 'limit') {
          showLimitPopup(errorData.allowed_devices, errorData.used_devices);
        } else {
          throw new Error(errorData.message || 'Failed to fetch script');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching script:', error);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        html: `Could not fetch script from server.<br>Error: ${error.message}<br>Please check your license and try again.`,
        confirmButtonText: 'OK',
        customClass: { container: 'swal-high-zindex' }
      });
    }
  }

  // Add styles
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);

  // Initial license verification on page load
  const initialCheck = await checkExistingActivation();
  if (initialCheck.valid === false && initialCheck.reason === 'wrong_project') {
    showWrongProjectPopup(initialCheck.message, initialCheck.wrongProject);
  }

  // Create the settings popup
  await createSettingsPopup();
})();
