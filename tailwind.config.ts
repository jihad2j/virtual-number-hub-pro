import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				silver: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
				},
				orange: {
					primary: '#FF8C42',
					secondary: '#FF6B1A', 
					accent: '#FFB366',
					light: '#FFF4E6',
					dark: '#D63384'
				},
				blue: {
					primary: '#4285F4',
					secondary: '#1E88E5',
					accent: '#5BA3F5',
					light: '#E3F2FD',
					dark: '#0D47A1'
				},
				purple: {
					primary: '#8B5CF6',
					secondary: '#7C3AED', 
					accent: '#A855F7',
					light: '#F3E8FF',
					dark: '#581C87'
				},
				green: {
					primary: '#10B981',
					secondary: '#059669',
					accent: '#34D399',
					light: '#D1FAE5',
					dark: '#047857'
				},
				pink: {
					primary: '#EC4899',
					secondary: '#DB2777',
					accent: '#F472B6',
					light: '#FCE7F3',
					dark: '#BE185D'
				},
				yellow: {
					primary: '#F59E0B',
					secondary: '#D97706',
					accent: '#FBBF24',
					light: '#FEF3C7',
					dark: '#92400E'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'rainbow-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(255, 140, 66, 0.4), 0 0 40px rgba(66, 133, 244, 0.2)'
					},
					'25%': {
						boxShadow: '0 0 20px rgba(66, 133, 244, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)'
					},
					'75%': {
						boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)'
					}
				},
				'bounce-gentle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-5px)'
					}
				},
				'pulse-rainbow': {
					'0%, 100%': {
						background: 'linear-gradient(45deg, #FF8C42, #4285F4)'
					},
					'25%': {
						background: 'linear-gradient(45deg, #4285F4, #EC4899)'
					},
					'50%': {
						background: 'linear-gradient(45deg, #EC4899, #10B981)'
					},
					'75%': {
						background: 'linear-gradient(45deg, #10B981, #F59E0B)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'rainbow-glow': 'rainbow-glow 3s ease-in-out infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'pulse-rainbow': 'pulse-rainbow 4s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-silver': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)',
				'gradient-colorful': 'linear-gradient(135deg, #FF8C42 0%, #4285F4 25%, #EC4899 50%, #10B981 75%, #F59E0B 100%)',
				'gradient-orange-blue': 'linear-gradient(135deg, #FF8C42 0%, #4285F4 100%)',
				'gradient-purple-pink': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
				'gradient-blue-green': 'linear-gradient(135deg, #4285F4 0%, #10B981 100%)',
				'gradient-pink-yellow': 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
				'gradient-rainbow': 'linear-gradient(90deg, #FF8C42, #4285F4, #EC4899, #10B981, #F59E0B)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
