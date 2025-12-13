export const COVER_PAGE_TEMPLATES = [
    {
        name: 'Alphabet',
        description: 'Light, patterned background with large decorative letters.',
        thumbnailColor: '#f9f9f9',
        html: `
      <div class="cover-page alphabet" style="display: flex; flex-direction: column; height: 1000px; padding: 40px; border: 1px solid #eee; background: #fff; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(#e0e0e0 1px, transparent 1px); background-size: 20px 20px; opacity: 0.3; z-index: 0;"></div>
        <div style="z-index: 1;">
          <h1 style="font-size: 96px; color: #333; margin-bottom: 20px; text-transform: uppercase; font-family: serif; opacity: 0.1; letter-spacing: 20px;">ALPHABET</h1>
          <div style="border-top: 4px solid #333; margin-bottom: 40px;"></div>
          <h1 data-field="title" contenteditable="true" style="font-size: 48px; color: #000; margin-bottom: 20px;">[Type the document title]</h1>
          <h2 data-field="subtitle" contenteditable="true" style="font-size: 24px; color: #666; margin-bottom: 60px; font-weight: normal;">[Type the document subtitle]</h2>
          <div style="margin-top: auto;">
             <p data-field="date" contenteditable="true" style="font-weight: bold; margin-bottom: 5px;">[Date]</p>
             <p data-field="author" contenteditable="true" style="margin-bottom: 5px;">[Author Name]</p>
             <p data-field="company" contenteditable="true">[Company Name]</p>
          </div>
        </div>
      </div>
    `
    },
    {
        name: 'Annual',
        description: 'Simple, clean layout. Shows large [Year].',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page annual" style="padding: 50px; height: 1000px; background: #fff; border-top: 10px solid #ccc; position: relative;">
        <div style="position: absolute; top: 100px; right: 50px;">
           <span data-field="year" contenteditable="true" style="font-size: 150px; color: #e6e6e6; font-weight: bold;">[Year]</span>
        </div>
        <div style="margin-top: 150px; border-left: 5px solid #2d2d2d; padding-left: 20px;">
           <h1 data-field="title" contenteditable="true" style="font-size: 42px; color: #2d2d2d; margin-bottom: 10px;">[Type the document title]</h1>
           <h3 data-field="subtitle" contenteditable="true" style="font-size: 18px; color: #666; font-weight: normal;">[Type the document subtitle]</h3>
        </div>
        <div style="position: absolute; bottom: 50px; left: 50px; right: 50px; border-top: 1px solid #ccc; padding-top: 20px;">
           <p data-field="abstract" contenteditable="true" style="font-style: italic; color: #555;">[Type the abstract of the document here. The abstract is typically a short summary of the contents of the document.]</p>
           <p data-field="author" contenteditable="true" style="margin-top: 20px; font-weight: bold;">[Author]</p>
        </div>
      </div>
    `
    },
    {
        name: 'Austere',
        description: 'Minimalist design with a solid sidebar.',
        thumbnailColor: '#f4f4f4',
        html: `
      <div class="cover-page austere" style="height: 1000px; display: flex; background: #fff;">
        <div style="width: 25%; background: #2d2d2d; height: 100%;"></div>
        <div style="width: 75%; padding: 60px;">
           <div style="background: #a32626; color: #fff; padding: 10px 20px; display: inline-block; margin-bottom: 40px;">
              <span data-field="year" contenteditable="true">[Year]</span>
           </div>
           <h1 data-field="title" contenteditable="true" style="font-size: 36px; color: #000; text-transform: uppercase;">[Type the document title]</h1>
           <p data-field="subtitle" contenteditable="true" style="font-size: 16px; color: #666; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 10px;">[Type the document subtitle]</p>
           <div style="margin-top: 200px;">
              <p data-field="author" contenteditable="true" style="display: block; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">[Author Name]</p>
              <p data-field="company" contenteditable="true" style="font-size: 14px; color: #555;">[Company Name]</p>
           </div>
        </div>
      </div>
    `
    },
    {
        name: 'Austin',
        description: 'Modern blue-themed cover page.',
        thumbnailColor: '#e0f2f7',
        html: `
      <div class="cover-page austin" style="height: 1000px; background: #fff; border: 1px solid #ccc; position: relative; padding: 40px;">
         <div style="background: #395e86; padding: 40px; color: #fff;">
            <h1 data-field="title" contenteditable="true" style="font-size: 32px; margin-bottom: 10px;">[Type the document title]</h1>
            <p data-field="subtitle" contenteditable="true" style="font-size: 16px; opacity: 0.9;">[Type the document subtitle]</p>
         </div>
         <div style="margin-top: 20px; padding: 20px; background: #f0f0f0; border-left: 10px solid #bba454;">
             <p data-field="abstract" contenteditable="true" style="font-size: 14px; color: #333;">[Type the abstract of the document here. The abstract is typically a short summary of the contents of the document.]</p>
         </div>
         <div style="position: absolute; bottom: 40px; right: 40px; text-align: right;">
             <p data-field="author" contenteditable="true" style="font-weight: bold; color: #395e86;">[Author]</p>
             <p data-field="company" contenteditable="true">[Company]</p>
         </div>
      </div>
    `
    },
    {
        name: 'Conservative',
        description: 'Highly plain, text-only design.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page conservative" style="height: 1000px; background: #fff; padding: 80px; text-align: center; border: 1px solid #ddd;">
         <div style="border: 2px solid #000; padding: 60px;">
            <h1 data-field="title" contenteditable="true" style="font-size: 40px; margin-bottom: 20px;">[Type the document title]</h1>
            <h3 data-field="subtitle" contenteditable="true" style="font-size: 20px; font-weight: normal; color: #555; margin-bottom: 60px;">[Type the document subtitle]</h3>
            
            <p data-field="date" contenteditable="true" style="font-style: italic;">[Pick the date]</p>
            
            <div style="margin-top: 100px;">
               <p data-field="author" contenteditable="true" style="font-weight: bold;">[Author Name]</p>
               <p data-field="company" contenteditable="true">[Company Name]</p>
            </div>
            
            <div style="margin-top: 50px; text-align: left;">
               <p data-field="abstract" contenteditable="true" style="font-size: 14px; color: #444;">[Type the abstract of the document here. The abstract is typically a short summary of the contents of the document.]</p>
            </div>
         </div>
      </div>
    `
    },
    {
        name: 'Contrast',
        description: 'Dark-gradient background theme.',
        thumbnailColor: '#333',
        html: `
      <div class="cover-page contrast" style="height: 1000px; background: linear-gradient(to bottom, #333 0%, #000 100%); color: #fff; padding: 60px; position: relative;">
         <div style="border-right: 4px solid #fff; padding-right: 20px; display: inline-block;">
             <h1 data-field="title" contenteditable="true" style="font-size: 48px; text-align: right;">[Type the document title]</h1>
         </div>
         <div style="margin-top: 40px;">
             <span style="background: #fff; color: #000; padding: 5px 10px; font-weight: bold; display: inline-block; margin-bottom: 10px;">[Year]</span>
             <p data-field="subtitle" contenteditable="true" style="font-size: 20px; color: #ccc;">[Type the document subtitle]</p>
         </div>
         <div style="position: absolute; bottom: 60px; left: 60px;">
             <p data-field="author" contenteditable="true" style="font-weight: bold; font-size: 18px;">[Author Name]</p>
             <p data-field="company" contenteditable="true" style="color: #aaa;">[Company Name]</p>
         </div>
      </div>
    `
    },
    {
        name: 'Exposure',
        description: 'Uses full-width image background at the top.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page exposure" style="height: 1000px; background: #fff; position: relative;">
         <div style="height: 400px; background: #ddd url('https://placehold.co/800x400/333/fff?text=Image') center/cover; position: relative;">
             <div style="position: absolute; bottom: 0; left: 40px; background: rgba(255,255,255,0.9); padding: 30px; width: 60%;">
                 <h1 data-field="title" contenteditable="true" style="font-size: 32px; color: #333; margin: 0;">[Type the document title]</h1>
                 <p data-field="subtitle" contenteditable="true" style="font-size: 18px; color: #666; margin-top: 10px;">[Type the document subtitle]</p>
             </div>
         </div>
         <div style="padding: 40px;">
             <p data-field="year" contenteditable="true" style="font-size: 24px; color: #999; font-weight: bold; margin-bottom: 40px;">[Year]</p>
             <p data-field="author" contenteditable="true">[Author]</p>
         </div>
      </div>
    `
    },
    {
        name: 'Grid',
        description: 'Contains grid-style arrangement.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page grid" style="height: 1000px; background: #fff; display: flex; flex-direction: column;">
         <div style="background: #2b579a; color: #fff; padding: 60px; flex: 1;">
             <h1 data-field="title" contenteditable="true" style="font-size: 42px; text-transform: uppercase;">[Type the document title]</h1>
             <p data-field="subtitle" contenteditable="true" style="border-top: 1px solid rgba(255,255,255,0.5); padding-top: 10px; margin-top: 10px;">[Type the document subtitle]</p>
         </div>
         <div style="height: 40%; padding: 60px; display: flex; gap: 20px;">
             <div style="flex: 1; border-right: 1px solid #ccc; padding-right: 20px;">
                 <p data-field="abstract" contenteditable="true" style="font-size: 14px;">[Abstract text goes here...]</p>
             </div>
             <div style="flex: 1;">
                 <p data-field="author" contenteditable="true" style="font-weight: bold;">[Author]</p>
                 <p data-field="date" contenteditable="true">[Date]</p>
             </div>
         </div>
      </div>
    `
    },
    {
        name: 'Mod',
        description: 'Uses alternating color blocks.',
        thumbnailColor: '#333',
        html: `
      <div class="cover-page mod" style="height: 1000px; background: #fff; position: relative;">
         <div style="background: #1f3b58; height: 150px;"></div>
         <div style="background: #4a86e8; width: 60%; padding: 40px; margin-top: -50px; margin-left: 40px; color: #fff; position: relative; z-index: 2;">
             <h1 data-field="title" contenteditable="true" style="font-size: 36px; margin: 0;">[Type the document title]</h1>
         </div>
         <div style="padding: 40px 40px 40px 150px;">
             <h3 data-field="subtitle" contenteditable="true" style="color: #666;">[Type the document subtitle]</h3>
             <div style="margin-top: 100px;">
                 <p data-field="author" contenteditable="true" style="font-weight: bold;">[Author]</p>
                 <p data-field="company" contenteditable="true">[Company]</p>
             </div>
             <div style="border-radius: 50%; width: 100px; height: 100px; background: #ccc; position: absolute; bottom: 100px; right: 100px;"></div>
             <div style="border-radius: 50%; width: 60px; height: 60px; background: #999; position: absolute; bottom: 180px; right: 180px;"></div>
         </div>
      </div>
    `
    },
    {
        name: 'Motion',
        description: 'Uses angled stripe design indicating speed.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page motion" style="height: 1000px; background: #fff; position: relative; overflow: hidden;">
         <div style="position: absolute; top: 0; right: 0; width: 100%; height: 200px; background: #93c47d; transform: skewY(-5deg); transform-origin: top right;"></div>
         <div style="position: absolute; top: 50px; right: 0; width: 100%; height: 50px; background: #38761d; transform: skewY(-5deg); transform-origin: top right;"></div>
         
         <div style="margin-top: 250px; padding: 50px;">
             <div style="background: #395e86; color: #fff; padding: 20px; display: inline-block;">
                 <h1 data-field="title" contenteditable="true" style="margin: 0;">[Type the document title]</h1>
             </div>
             <h3 data-field="subtitle" contenteditable="true" style="color: #666; margin-top: 20px;">[Type the document subtitle]</h3>
         </div>

         <div style="position: absolute; bottom: 0; right: 50px; padding: 20px; text-align: right;">
             <span data-field="year" contenteditable="true" style="font-size: 60px; color: #93c47d; font-weight: bold;">[Year]</span>
             <p data-field="author" contenteditable="true">[Author]</p>
             <p data-field="company" contenteditable="true">[Company]</p>
         </div>
      </div>
    `
    },
    {
        name: 'Orientation',
        description: 'Vertical bar to the left.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page orientation" style="height: 1000px; background: #fff; display: flex;">
         <div style="width: 80px; background: #111; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 50px;">
             <span data-field="year" contenteditable="true" style="writing-mode: vertical-rl; color: #fff; font-size: 24px; letter-spacing: 5px;">[YEAR]</span>
         </div>
         <div style="padding: 60px; flex: 1;">
             <h1 data-field="title" contenteditable="true" style="font-size: 42px; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 20px;">[Type the document title]</h1>
             <p data-field="subtitle" contenteditable="true" style="font-size: 18px; color: #666;">[Type the document subtitle]</p>
             
             <div style="margin-top: 200px;">
                 <p data-field="author" contenteditable="true" style="font-weight: bold;">[Author]</p>
                 <p data-field="date" contenteditable="true" style="color: #666;">[Date]</p>
             </div>
         </div>
      </div>
    `
    },
    {
        name: 'Perspective',
        description: 'Uses angled text box with shadow.',
        thumbnailColor: '#3f51b5',
        html: `
      <div class="cover-page perspective" style="height: 1000px; background: #3f51b5; color: #fff; position: relative; overflow: hidden;">
         <div style="position: absolute; top: 0; right: 0; bottom: 0; width: 40%; background: rgba(255,255,255,0.1); transform: skewX(-10deg);"></div>
         
         <div style="padding: 80px; width: 60%;">
             <div style="background: rgba(0,0,0,0.2); padding: 40px; box-shadow: 10px 10px 20px rgba(0,0,0,0.3); transform: rotate(-2deg);">
                 <h1 data-field="title" contenteditable="true" style="font-size: 36px;">[Type the document title]</h1>
                 <p data-field="subtitle" contenteditable="true" style="border-top: 1px solid rgba(255,255,255,0.5); padding-top: 10px; margin-top: 10px;">[Type the document subtitle]</p>
             </div>
         </div>
         
         <div style="position: absolute; bottom: 50px; left: 80px;">
             <p data-field="author" contenteditable="true">[Author]</p>
             <p data-field="company" contenteditable="true">[Company]</p>
         </div>
      </div>
    `
    },
    {
        name: 'Pinstripe',
        description: 'Very formal thin-line pattern.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page pinstripe" style="height: 1000px; background: #fff; border-left: 20px solid #2d2d2d; padding: 40px;">
         <div style="border-left: 1px solid #2d2d2d; border-right: 1px solid #2d2d2d; height: 90%; padding: 40px; position: relative;">
             <div style="position: absolute; top: 0; left: 20px; right: 20px; height: 2px; background: #2d2d2d;"></div>
             <div style="position: absolute; bottom: 0; left: 20px; right: 20px; height: 2px; background: #2d2d2d;"></div>
             
             <h1 data-field="title" contenteditable="true" style="margin-top: 100px; font-size: 40px;">[Type the document title]</h1>
             <p data-field="subtitle" contenteditable="true" style="font-size: 18px; color: #666;">[Type the document subtitle]</p>
             
             <div style="margin-top: 100px;">
                 <p data-field="author" contenteditable="true" style="font-weight: bold;">[Author]</p>
                 <p data-field="date" contenteditable="true">[Date]</p>
             </div>
         </div>
      </div>
    `
    },
    {
        name: 'Sideline',
        description: 'Left-side colored stripe.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page sideline" style="height: 1000px; background: #fff; display: flex;">
         <div style="width: 120px; background: #e06666; padding: 20px; text-align: center;">
             <p data-field="year" contenteditable="true" style="color: #fff; font-weight: bold; font-size: 24px;">[Year]</p>
         </div>
         <div style="flex: 1; padding: 60px;">
             <h1 data-field="title" contenteditable="true" style="font-size: 44px; color: #cc0000;">[Type the document title]</h1>
             <h3 data-field="subtitle" contenteditable="true" style="font-size: 20px; color: #666; margin-top: 10px;">[Type the document subtitle]</h3>
             <div style="margin-top: 150px; border-top: 2px solid #eee; padding-top: 20px;">
                 <p data-field="author" contenteditable="true" style="font-weight: bold;">[Author]</p>
                 <p data-field="company" contenteditable="true">[Company]</p>
             </div>
         </div>
      </div>
    `
    },
    {
        name: 'Stacks',
        description: 'Overlapping rectangular boxes.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page stacks" style="height: 1000px; background: #fff; padding: 80px; position: relative;">
         <div style="border: 2px solid #000; padding: 40px; position: relative; z-index: 2; background: #fff;">
             <h1 data-field="title" contenteditable="true" style="font-size: 38px;">[Type the document title]</h1>
             <p data-field="subtitle" contenteditable="true" style="color: #666;">[Type the document subtitle]</p>
         </div>
         <div style="position: absolute; top: 100px; left: 100px; width: 60%; height: 200px; background: #ddd; z-index: 1;"></div>
         
         <div style="margin-top: 200px;">
             <p data-field="author" contenteditable="true" style="font-weight: bold;">[Author]</p>
         </div>
         
         <div style="position: absolute; bottom: 80px; width: 80%; border-top: 5px solid #000; padding-top: 10px;">
             <p data-field="abstract" contenteditable="true" style="font-style: italic;">[Abstract]</p>
         </div>
      </div>
    `
    },
    {
        name: 'Tiles',
        description: 'Multiple colored tile blocks.',
        thumbnailColor: '#fff',
        html: `
      <div class="cover-page tiles" style="height: 1000px; background: #fff; padding: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
         <div style="grid-column: 1 / span 2; background: #6aa84f; padding: 40px; color: #fff;">
             <h1 data-field="title" contenteditable="true" style="margin: 0; font-size: 36px;">[Type the document title]</h1>
         </div>
         <div style="background: #f1c232; height: 150px;"></div>
         <div style="background: #e69138; padding: 20px; color: #fff;">
             <span data-field="year" contenteditable="true" style="font-size: 24px; font-weight: bold;">[Year]</span>
         </div>
         <div style="grid-column: 1 / span 2; padding: 40px; border: 1px solid #ccc;">
             <p data-field="subtitle" contenteditable="true" style="font-size: 18px; color: #666; margin-bottom: 20px;">[Type the document subtitle]</p>
             <p data-field="author" contenteditable="true">[Author]</p>
         </div>
         <div style="grid-column: 1 / span 2; background: #cc0000; height: 20px;"></div>
      </div>
    `
    },
    {
        name: 'Transcend',
        description: 'Elegant, minimalistic, calm appearance.',
        thumbnailColor: '#e0e0e0',
        html: `
      <div class="cover-page transcend" style="height: 1000px; background: #f3f3f3; padding: 60px; border: 1px solid #ddd;">
         <div style="text-align: right; margin-bottom: 40px;">
             <span data-field="year" contenteditable="true" style="font-size: 14px; color: #999;">[PICK THE DATE]</span>
         </div>
         
         <div style="background: #fff; padding: 60px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
             <h1 data-field="title" contenteditable="true" style="font-size: 32px; color: #5b5b5b; letter-spacing: 1px;">[Type the document title]</h1>
             <p data-field="subtitle" contenteditable="true" style="color: #888; margin-top: 10px; font-weight: 300;">[Type the document subtitle] | [Type the author name]</p>
         </div>
         
         <div style="margin-top: 40px; color: #777; font-size: 14px; line-height: 1.6;">
             <p data-field="abstract" contenteditable="true">[Type the abstract of the document here. The abstract is typically a short summary of the contents of the document.]</p>
         </div>
      </div>
    `
    }
];
