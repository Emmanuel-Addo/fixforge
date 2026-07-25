import Hero from '@/components/Hero'
import FeatureStack from '@/components/FeatureStack'
import ProblemSection from '@/components/ProblemSession'
import Footer from '@/components/Footer'
import TestimonialCards from '@/components/TestimonialCards'

const page = () => {
  return (
    <div>
        <Hero/>
        <FeatureStack/>
        <ProblemSection/>
        <TestimonialCards/>
        <Footer/>
    </div>
  )
}

export default page
