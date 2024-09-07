(function() {
  // Store the original logo data
  let originalLogoData = null;

  // Listen for messages from the Templately platform
  window.addEventListener("message", function (event) {
    // Check if the message has the correct type
    if (!event || !event.data || event.data.type !== "templately_css_variable") {
      return;
    }

    // console.log("Received message from Templately", event.data);

    // Destructure the data from the message
    const { platform, color, logo, logoSize } = event.data;

    // Initialize variables for the color property prefix and logo selector
    let colorPropertyPrefix;
    let logoSelector;

    // Set the color property prefix and logo selector based on the platform
    if (platform === "elementor") {
      colorPropertyPrefix = "--e-global-color-";
      logoSelector = ".elementor-widget-tl-site-logo img, .elementor-widget-theme-site-logo img";
    } else if (platform === "gutenberg") {
      colorPropertyPrefix = "";
      logoSelector = ".eb-advanced-image-wrapper img.custom-logo";
    } else {
      return;
    }

    // If color data is provided, set the color properties
    if (color) {
      Object.entries(color).forEach(([id, colorValue]) => {
        const property = colorPropertyPrefix + id;
        document.body.style.setProperty(property, colorValue);
      });
    }

    // If logo data is provided, update the logos
    if (logo) {
      const logoElements = document.querySelectorAll(logoSelector);

      if (logoElements.length) {
        // Check if originalLogoData needs initialization
        if (!originalLogoData) {
          originalLogoData = [];
          logoElements.forEach(logoElement => {
            const element = platform === 'elementor' ? logoElement : logoElement.closest('.image-wrapper');
            let width = logoElement.style.width;
            if (!width && element) {
              const style = window.getComputedStyle(element);
              width = style.getPropertyValue('width');
            }
            originalLogoData.push({
              src: logoElement.src,
              width: width
            });
          });
        }

        // Update each logo element
        logoElements.forEach(logoElement => {
          try {
            new URL(logo); // This will throw an error if `logo` is not a valid URL
            logoElement.src         = logo;
            logoElement.srcset      = '';
            logoElement.style.width = logoSize + "px";
          } catch (e) {
            console.error('Invalid logo URL:', logo);
          }
        });
      }
    }
    // If no logo data and originalLogoData exists, revert all logos
    else if (originalLogoData) {
      const logoElements = document.querySelectorAll(logoSelector);

      logoElements.forEach(logoElement => {
        const matchingData = originalLogoData.find(data => data.src === logoElement.src); // Find matching data based on original src
        if (matchingData) {
          logoElement.src = matchingData.src;
          logoElement.style.width = matchingData.width;
        } else if(originalLogoData && typeof originalLogoData[0] !== 'undefined') {
          // If no match, use the first original data (assuming all logos were the same initially)
          logoElement.src = originalLogoData[0].src;
          logoElement.style.width = originalLogoData[0].width;
        }
      });
    }


    if(originalLogoData){
      // console.log("Original logo data", originalLogoData);
      event.source.postMessage({
        type: 'templately_css_variable',
        logoWidth: originalLogoData.width,
      }, '*');

    }

  });
})();