import React, { useState } from 'react';
import { User, Award } from 'lucide-react';
import { consultantProfile } from '../content/consultantData';
import { CONTAINER } from './container';

export const HeroConsultingSection: React.FC = () => {
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(3);

  return (
    <section id="consulting" className="w-full pt-4 pb-16">
      <div className={CONTAINER}>
        
        {/* Section Header matching Mockup: "THE HERO SECTION" */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500">
              The Hero Section
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Client Acquisition & Strategic Advisory Gateway
            </p>
          </div>
          <span className="text-xs font-semibold text-[#3B8B94]">
            10+ Years Dedicated Analytics Experience
          </span>
        </div>

        {/* Consulting Gateway Container matching exact Mockup Layout */}
        <div className="zohelo-card p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN (Cols 1-7): Profile & Timeline */}
            <div className="lg:col-span-12 flex flex-col justify-between h-full space-y-6">
              
              {/* Header Profile Block matching Mockup */}
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#3B8B94] tracking-wide mb-1">
                  <span>Premium B2B consulting gateway</span>
                </div>

                <div className="flex items-start space-x-4">
                  {/* Portrait Avatar */}
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#3B8B94] to-[#3A6FA4] p-0.5 shadow-md">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {/* Styled avatar representing Radosław Utkała */}
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-700">
                        <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500 mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Name matching Mockup */}
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#24292E] tracking-tight leading-tight">
                      Analytics Solutions & Consulting
                    </h3>
                    <div className="text-lg sm:text-xl font-bold text-[#3B8B94] mt-0.5 font-serif-heading">
                      {consultantProfile.name}
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {consultantProfile.title}
                    </div>
                  </div>
                </div>

                {/* Bio text matching Mockup */}
                <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed max-w-xl">
                  {consultantProfile.bio}
                </p>
              </div>

              {/* Career Timeline (2014, 2017, 2020, 2024) matching exact Mockup */}
              <div className="pt-2">
                
                {/* Horizontal Timeline Bar */}
                <div className="relative pt-6 pb-2">
                  
                  {/* Background Connecting Line */}
                  <div className="absolute top-8 left-4 right-4 h-0.5 bg-slate-200" />
                  
                  <div className="grid grid-cols-4 gap-2 relative z-10">
                    {consultantProfile.timeline.map((item, index) => {
                      const isActive = activeTimelineIndex === index;
                      return (
                        <div
                          key={item.year}
                          onClick={() => setActiveTimelineIndex(index)}
                          className="flex flex-col items-center text-center group cursor-pointer"
                        >
                          {/* Dot on Line */}
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                              isActive
                                ? 'bg-[#3B8B94] border-[#3B8B94] scale-125 shadow-xs'
                                : 'bg-white border-slate-300 group-hover:border-[#3B8B94]'
                            }`}
                          >
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Year */}
                          <span className={`text-xs sm:text-sm font-extrabold font-mono-code mt-3 transition-colors ${
                            isActive ? 'text-[#3B8B94]' : 'text-slate-700 group-hover:text-slate-900'
                          }`}>
                            {item.year}
                          </span>

                          {/* Role Label */}
                          <span className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-tight line-clamp-2">
                            {item.role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Milestone Card */}
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
                  <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                    <Award className="w-3.5 h-3.5 text-[#3B8B94]" />
                    <span>{consultantProfile.timeline[activeTimelineIndex].year} Milestone:</span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                    {consultantProfile.timeline[activeTimelineIndex].description}
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
