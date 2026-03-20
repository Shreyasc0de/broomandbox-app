import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
    const reviews = [
        { name: "Sarah Jenkins", text: "Broom & Box did an excellent job cleaning our office. Very professional team.", rating: 5 },
        { name: "Mark Thompson", text: "The deep cleaning service was incredible. My house feels brand new again!", rating: 5 },
        { name: "Elena Rodriguez", text: "Reliable, thorough, and friendly. I've been using them for months and couldn't be happier.", rating: 5 },
    ];

    return (
        <section className="py-24 bg-surface">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl mb-4">Customer Testimonials</h2>
                    <div className="flex items-center justify-center gap-1 text-yellow-400 mb-8">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-current" />)}
                        <span className="ml-2 text-ink font-bold">4.9/5 Rating</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((r, i) => (
                        <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-serif italic">“</div>
                            <div className="flex text-yellow-400 mb-6">
                                {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-lg text-ink/80 italic mb-8 leading-relaxed">“{r.text}”</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center font-bold text-primary">
                                    {r.name.charAt(0)}
                                </div>
                                <p className="font-bold text-ink">{r.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
