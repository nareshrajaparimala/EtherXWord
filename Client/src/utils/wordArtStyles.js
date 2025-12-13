export const wordArtStyles = [
    // ROW 1: Outline / Simple
    {
        id: 'wa-1',
        name: 'Outline Black',
        style: {
            color: 'transparent',
            WebkitTextStroke: '1px #000',
            textShadow: '0px 0px 1px rgba(255,255,255,0.5)', // Visibility on dark
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-2',
        name: 'Fill Blue',
        style: {
            color: '#1e90ff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontWeight: 'bold',
            fontFamily: 'Impact, sans-serif'
        }
    },
    {
        id: 'wa-3',
        name: 'Fill Orange, Accent 2',
        style: {
            color: '#ed7d31',
            textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-4',
        name: 'Outline Blue, Fill White',
        style: {
            color: 'white',
            WebkitTextStroke: '1.5px #1e90ff',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-5',
        name: 'Fill Gold, Bevel',
        style: {
            color: '#ffd700',
            textShadow: '1px 1px 0 #b8860b, 2px 2px 0 #b8860b, 3px 3px 0 rgba(0,0,0,0.2)',
            fontWeight: 'bold',
            fontFamily: 'Georgia, serif'
        }
    },
    {
        id: 'wa-6',
        name: 'Gradient Gray',
        style: {
            background: 'linear-gradient(to bottom, #cccccc, #555555)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },

    // ROW 2: Gradients & Shadows
    {
        id: 'wa-7',
        name: 'Gradient Gold',
        style: {
            background: 'linear-gradient(to bottom, #ffd700, #ff8c00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontWeight: 'bold',
            fontFamily: 'Verdana, sans-serif'
        }
    },
    {
        id: 'wa-8',
        name: 'Gradient Blue',
        style: {
            background: 'linear-gradient(to bottom, #00bfff, #1e90ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0px 0px 10px rgba(30,144,255,0.6)',
            fontWeight: 'bold',
            fontFamily: 'Trebuchet MS, sans-serif'
        }
    },
    {
        id: 'wa-9',
        name: 'Gradient Green',
        style: {
            background: 'linear-gradient(to bottom, #32cd32, #006400)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            WebkitTextStroke: '0.5px #fff',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-10',
        name: 'Gradient Purple',
        style: {
            background: 'linear-gradient(to bottom, #da70d6, #800080)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
            fontWeight: 'bold',
            fontFamily: 'Palatino Linotype, serif'
        }
    },
    {
        id: 'wa-11',
        name: 'Gradient Red',
        style: {
            background: 'linear-gradient(to bottom, #ff6347, #8b0000)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))',
            fontWeight: 'bold',
            fontFamily: 'Impact, sans-serif'
        }
    },
    {
        id: 'wa-12',
        name: 'Metal Silver',
        style: {
            background: 'linear-gradient(to bottom, #e6e6e6 0%, #000000 50%, #e6e6e6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif',
            textShadow: '0px 1px 1px rgba(255,255,255,0.3)'
        }
    },

    // ROW 3: Reflections & Glow
    {
        id: 'wa-13',
        name: 'Reflection Blue',
        style: {
            color: '#0056b3',
            WebkitBoxReflect: 'below -5px linear-gradient(transparent, rgba(0,0,0,0.2))',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }
    },
    {
        id: 'wa-14',
        name: 'Reflection Orange',
        style: {
            color: '#ff4500',
            WebkitBoxReflect: 'below -5px linear-gradient(transparent, rgba(0,0,0,0.3))',
            fontWeight: 'bold',
            fontFamily: 'Calibri, sans-serif'
        }
    },
    {
        id: 'wa-15',
        name: 'Glow Neon Cyan',
        style: {
            color: 'transparent',
            WebkitTextStroke: '2px #00ffff',
            textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
            fontWeight: 'bold',
            fontFamily: 'Courier New, monospace'
        }
    },
    {
        id: 'wa-16',
        name: 'Glow Magenta',
        style: {
            color: '#ff00ff',
            textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-17',
        name: 'Glow Gold',
        style: {
            color: '#ffd700',
            textShadow: '0 0 10px #ffd700, 0 0 20px #ffa500',
            fontWeight: 'bold',
            fontFamily: 'Times New Roman, serif'
        }
    },
    {
        id: 'wa-18',
        name: 'Retro Wave',
        style: {
            background: 'linear-gradient(to bottom, #00ffff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },

    // ROW 4: 3D & Transforms
    {
        id: 'wa-19',
        name: '3D Extrude Gray',
        style: {
            color: '#ddd',
            textShadow: '1px 1px 0 #999, 2px 2px 0 #888, 3px 3px 0 #777, 4px 4px 0 #666',
            fontWeight: 'bold',
            fontFamily: 'Verdana, sans-serif'
        }
    },
    {
        id: 'wa-20',
        name: '3D Extrude Blue',
        style: {
            color: '#aaddff',
            textShadow: '1px 1px 0 #336699, 2px 2px 0 #336699, 3px 3px 0 #336699, 4px 4px 0 #336699',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-21',
        name: 'Perspective Left',
        style: {
            color: '#2f5496',
            transform: 'perspective(200px) rotateY(20deg)',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }
    },
    {
        id: 'wa-22',
        name: 'Perspective Right',
        style: {
            color: '#c00000',
            transform: 'perspective(200px) rotateY(-20deg)',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }
    },
    {
        id: 'wa-23',
        name: 'Skewed',
        style: {
            color: '#555',
            transform: 'skewX(-20deg)',
            textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
            fontWeight: 'bold',
            fontFamily: 'Impact, sans-serif'
        }
    },
    {
        id: 'wa-24',
        name: 'Stretched',
        style: {
            color: '#444',
            transform: 'scaleY(1.5)',
            fontWeight: 'bold',
            fontFamily: 'Arial Narrow, sans-serif',
            textShadow: '0 0 1px white' // Contrast
        }
    },

    // ROW 5: Unique / Pattern
    {
        id: 'wa-25',
        name: 'Pattern Chevron',
        style: {
            background: 'repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-26',
        name: 'Pattern Stripes',
        style: {
            background: 'repeating-linear-gradient(90deg, #ff0000, #ff0000 5px, #ffffff 5px, #ffffff 10px)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            WebkitTextStroke: '1px #ff0000',
            fontWeight: 'bold',
            fontFamily: 'Impact, sans-serif'
        }
    },
    {
        id: 'wa-27',
        name: 'Outline Dashed',
        style: {
            color: 'transparent',
            WebkitTextStroke: '1px #000',
            backgroundImage: 'linear-gradient(to right, #000 50%, transparent 50%)', // Hard to do true dashed stroke on text in standard CSS
            textShadow: '0 0 0 #000', // Fallback
            borderBottom: '2px dashed #000',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-28',
        name: 'Double Outline',
        style: {
            color: 'white',
            textShadow: '0 0 0 2px #000, 0 0 0 4px #fff, 0 0 0 6px #000',
            fontWeight: 'bold',
            fontFamily: 'Arial Black, sans-serif'
        }
    },
    {
        id: 'wa-29',
        name: 'Multicolor',
        style: {
            backgroundImage: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontFamily: 'Comic Sans MS, sans-serif'
        }
    },
    {
        id: 'wa-30',
        name: 'Classic Word',
        style: {
            color: '#fff',
            WebkitTextStroke: '1px #003366',
            textShadow: '2px 2px 2px #999',
            transform: 'scale(1, 1.2)',
            fontWeight: 'bold',
            fontFamily: 'Times New Roman, serif'
        }
    }
];
