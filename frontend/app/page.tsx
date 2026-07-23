import Hero from '@/components/Hero'
import FeatureStack from '@/components/FeatureStack'
import ProblemSection from '@/components/ProblemSession'
import Footer from '@/components/Footer'
import React from 'react'

const page = () => {
  return (
    <div>
        <Hero/>
        <FeatureStack/>
        <ProblemSection/>
        <Footer/>
    </div>
  )
}

export default page
