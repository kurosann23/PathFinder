import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useUserProgress } from '../../context/UserProgressContext'
import { 
  IconUser, 
  IconBook, 
  IconCalendar, 
  IconX, 
  IconChevronRight, 
  IconChevronLeft,
  IconTarget,
  IconCheck
} from '../icons'
import { cn } from '../../lib/cn'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '../ui/Button'

type Step = {
  id: number
  title: string
  description: string
  icon: React.ElementType
  actionLabel: string
  path: string
  color: string
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Complete Your Profile',
    description: 'Start your journey by uploading a profile picture to make your account personal and recognizable.',
    icon: IconUser,
    actionLabel: 'Go to Profile',
    path: '/profile',
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Discover Your Potential',
    description: 'Take our psychometric assessment to identify your strengths and find career paths that match your personality.',
    icon: IconTarget,
    actionLabel: 'Take Assessment',
    path: '/psychometric-test',
    color: 'bg-purple-500'
  },
  {
    id: 3,
    title: 'Explore Learning Paths',
    description: 'Browse through recommended courses tailored to your interests and career goals.',
    icon: IconBook,
    actionLabel: 'View Courses',
    path: '/course-recommendations',
    color: 'bg-emerald-500'
  },
  {
    id: 4,
    title: 'Connect with Mentors',
    description: 'Schedule appointments with teachers for guidance and support on your career journey.',
    icon: IconCalendar,
    actionLabel: 'Book Appointment',
    path: '/student-appointment',
    color: 'bg-orange-500'
  }
]

export type OnboardingGuideProps = {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const isLight = theme === 'light'

  const handleClose = () => {
    if (!user?.id) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      // Mark as seen when closed
      localStorage.setItem(`pathfinder_onboarding_completed_${user.id}`, 'true')
    }, 300)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleAction = () => {
    navigate(steps[currentStep].path)
    handleClose()
  }

  if (!isOpen) return null

  const step = steps[currentStep]
  const Icon = step.icon

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl ring-1 transition-all duration-300 transform",
        isLight ? "bg-white ring-black/5" : "bg-[#0B0E14] ring-white/10",
        isClosing ? "scale-95 opacity-0 translate-y-4" : "scale-100 opacity-100 translate-y-0"
      )}>
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={cn(
            "absolute right-4 top-4 z-10 rounded-full p-2 transition-colors",
            isLight 
              ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600" 
              : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          )}
          aria-label="Close guide"
        >
          <IconX size={20} />
        </button>

        <div className="p-8 pt-12">
          {/* Step Indicator */}
          <div className="mb-6 flex justify-center">
            <div className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1",
              isLight 
                ? "bg-slate-50 text-slate-600 ring-slate-200" 
                : "bg-slate-900 text-slate-400 ring-slate-800"
            )}>
              <span>Step {currentStep + 1}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span>{steps.length}</span>
            </div>
          </div>

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-900",
              step.color
            )}>
              <Icon size={40} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="mb-8 text-center">
            <h2 className={cn(
              "mb-3 text-2xl font-bold",
              isLight ? "text-slate-900" : "text-white"
            )}>
              {step.title}
            </h2>
            <p className={cn(
              "mx-auto max-w-sm text-base leading-relaxed",
              isLight ? "text-slate-600" : "text-slate-400"
            )}>
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full py-6 text-base shadow-lg shadow-blue-500/20"
              onClick={handleAction}
            >
              {step.actionLabel}
            </Button>
            
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors",
                  currentStep === 0
                    ? "opacity-0 cursor-default"
                    : isLight 
                      ? "text-slate-500 hover:text-slate-900" 
                      : "text-slate-500 hover:text-slate-300"
                )}
              >
                <IconChevronLeft size={16} />
                Back
              </button>

              <button
                onClick={handleNext}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors",
                  isLight 
                    ? "text-slate-500 hover:text-slate-900" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep !== steps.length - 1 && <IconChevronRight size={16} />}
                {currentStep === steps.length - 1 && <IconCheck size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
