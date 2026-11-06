import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import Footer from '../components/Footer';

const Contace = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-gray-50/50 flex flex-col justify-between">
            {/* ส่วนเนื้อหาหลัก */}
            <main className="flex-1 max-w-4xl mx-auto px-6 pt-28 pb-20 w-full">

                {/* หัวข้อหน้า - ปรับขนาดตัวหนังสือให้พอดี สบายตา */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-red-700 tracking-tight mb-2.5">
                        ติดต่อเรา
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-normal">
                        ช่องทางการติดต่อ JP TRIP แพลตฟอร์มรวบรวมข้อมูลและวางแผนการท่องเที่ยวในภูมิภาคคันโต ประเทศญี่ปุ่น พร้อมดูแลและให้บริการทุกคำถามของคุณ
                    </p>
                </div>

                {/* การ์ดข้อมูลติดต่อ 2 คอลัมน์ (TH & EN) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">

                    {/* การ์ดภาษาไทย (TH): ศูนย์บริการลูกค้า JP TRIP */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-gray-100 hover:shadow-md transition-shadow duration-300 text-left flex flex-col justify-between">
                        <div>
                            {/* Header การ์ด TH */}
                            <div className="flex items-start gap-4 mb-6 pb-5 border-b border-gray-100">
                                <div className="w-11 h-11 rounded-xl bg-red-700 text-white font-bold flex items-center justify-center shrink-0 shadow-xs text-sm">
                                    TH
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
                                        ศูนย์บริการลูกค้า JP TRIP
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5 leading-relaxed">
                                        ฝ่ายบริการข้อมูลการท่องเที่ยวและประสานงานผู้ใช้งาน
                                    </p>
                                </div>
                            </div>

                            {/* รายละเอียดการติดต่อ TH */}
                            <div className="space-y-5">
                                {/* ที่อยู่ */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">ที่อยู่</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed font-normal">
                                            เลขที่ 88 อาคาร JP TRIP ทาวเวอร์ ชั้น 18 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110
                                        </p>
                                    </div>
                                </div>

                                {/* โทรศัพท์ */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">โทรศัพท์</h3>
                                        <a
                                            href="tel:0630265402"
                                            className="text-sm md:text-base text-gray-800 hover:text-red-700 font-semibold transition-colors inline-block tracking-wide"
                                        >
                                            063-026-5402
                                        </a>
                                    </div>
                                </div>

                                {/* อีเมล */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">อีเมลติดต่อ</h3>
                                        <a
                                            href="mailto:tankemmexr@gmail.com"
                                            className="text-sm md:text-base text-gray-800 hover:text-red-700 font-semibold transition-colors inline-block"
                                        >
                                            tankemmexr@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* การ์ดภาษาอังกฤษ (EN): JP TRIP Customer Service Center */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-gray-100 hover:shadow-md transition-shadow duration-300 text-left flex flex-col justify-between">
                        <div>
                            {/* Header การ์ด EN */}
                            <div className="flex items-start gap-4 mb-6 pb-5 border-b border-gray-100">
                                <div className="w-11 h-11 rounded-xl bg-red-700 text-white font-bold flex items-center justify-center shrink-0 shadow-xs text-sm">
                                    EN
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
                                        JP TRIP Customer Service Center
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5 leading-relaxed">
                                        Travel Information & User Support Department
                                    </p>
                                </div>
                            </div>

                            {/* รายละเอียดการติดต่อ EN */}
                            <div className="space-y-5">
                                {/* Address */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">Address</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed font-normal">
                                            88 JP TRIP Tower, 18th Floor, Sukhumvit Road, Khlong Toei, Khlong Toei, Bangkok 10110, Thailand
                                        </p>
                                    </div>
                                </div>

                                {/* Telephone */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">Telephone</h3>
                                        <a
                                            href="tel:0630265402"
                                            className="text-sm md:text-base text-gray-800 hover:text-red-700 font-semibold transition-colors inline-block tracking-wide"
                                        >
                                            063-026-5402
                                        </a>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">Email</h3>
                                        <a
                                            href="mailto:tankemmexr@gmail.com"
                                            className="text-sm md:text-base text-gray-800 hover:text-red-700 font-semibold transition-colors inline-block"
                                        >
                                            tankemmexr@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            {/* Footer ประจำหน้า */}
            <Footer />
        </div>
    );
};

export default Contace;
