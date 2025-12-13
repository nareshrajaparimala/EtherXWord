
export const equationTemplates = [
  {
    name: "Area of Circle",
    description: "A = πr²",
    mathml: `A = πr²`
  },
  {
    name: "Binomial Theorem",
    description: "(x+a)ⁿ = Σ(n,k)xᵏaⁿ⁻ᵏ",
    mathml: `(x + a)ⁿ = Σ(k=0 to n) (n choose k) xᵏ aⁿ⁻ᵏ`
  },
  {
    name: "Expansion of a Sum",
    description: "(1+x)ⁿ = 1 + nx + ...",
    mathml: `(1 + x)ⁿ = 1 + nx/1! + n(n-1)x²/2! + ...`
  },
  {
    name: "Fourier Series",
    description: "f(x) = a₀ + Σ...",
    mathml: `f(x) = a₀ + Σ(n=1 to ∞) [aₙcos(nπx/L) + bₙsin(nπx/L)]`
  },
  {
    name: "Pythagorean Theorem",
    description: "a² + b² = c²",
    mathml: `a² + b² = c²`
  },
  {
    name: "Quadratic Formula",
    description: "x = (-b ± √...)/2a",
    mathml: `x = (-b ± √(b² - 4ac)) / 2a`
  },
  {
    name: "Taylor Expansion",
    description: "e^x = 1 + x/1! + ...",
    mathml: `eˣ = 1 + x/1! + x²/2! + x³/3! + ... , -∞ < x < ∞`
  },
  {
    name: "Matrix Identity",
    description: "I = [[1,0],[0,1]]",
    mathml: `I = [1  0]
    [0  1]`
  },
  {
    name: "Permutation Formula",
    description: "nPr = n!/(n-r)!",
    mathml: `P(n,k) = n! / (n-k)!`
  },
  {
    name: "Limit Definition of Derivative",
    description: "f'(x) = lim...",
    mathml: `f'(x) = lim(h→0) [f(x+h) - f(x)] / h`
  },
  {
    name: "Integral of Exponential",
    description: "∫ e^x dx = ...",
    mathml: `∫ eˣ dx = eˣ + C`
  },
  {
    name: "Ideal Gas Law",
    description: "PV = nRT",
    mathml: `PV = nRT`
  },
  {
    name: "Einstein Mass-Energy",
    description: "E = mc²",
    mathml: `E = mc²`
  },
  {
    name: "Bayes Theorem",
    description: "P(A|B) = ...",
    mathml: `P(A|B) = [P(B|A) × P(A)] / P(B)`
  },
  {
    name: "Distance Formula",
    description: "d = √((x₂-x₁)²...)",
    mathml: `d = √[(x₂-x₁)² + (y₂-y₁)²]`
  },
  {
    name: "Compound Interest",
    description: "A = P(1+r/n)ⁿᵗ",
    mathml: `A = P(1 + r/n)ⁿᵗ`
  },
  {
    name: "Sum of Geometric Series",
    description: "Sn = a(1-rⁿ)/(1-r)",
    mathml: `Sₙ = a(1 - rⁿ) / (1 - r)`
  },
  {
    name: "Volume of Sphere",
    description: "V = (4/3)πr³",
    mathml: `V = (4/3)πr³`
  },
  {
    name: "Law of Cosines",
    description: "c² = a² + b² - 2ab cos(C)",
    mathml: `c² = a² + b² - 2ab cos(C)`
  },
  {
    name: "Standard Deviation",
    description: "σ = √[Σ(x-μ)²/N]",
    mathml: `σ = √[Σ(xᵢ - μ)² / N]`
  }
];
