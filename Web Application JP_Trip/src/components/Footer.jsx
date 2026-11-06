import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50/90 border-t border-gray-200/80 pt-16 pb-10 text-left">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* คอลัมน์ที่ 1: แบรนด์และคำอธิบาย */}
        <div className="space-y-4">
          <Link to="/" className="inline-block group">
            <img
              src="/logo.png"
              alt="JP TRIP Logo"
              className="h-20 md:h-24 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            เราเป็นแพลตฟอร์มรวบรวมข้อมูลการท่องเที่ยวในภูมิภาคคันโต เพื่อช่วยให้ทริปญี่ปุ่นของคุณง่ายและพิเศษกว่าเดิม
          </p>
        </div>

        {/* คอลัมน์ที่ 2: เมนูหลัก */}
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-gray-400">เมนู</h4>
          <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
            <li>
              <Link to="/" className="hover:text-red-600 transition-colors inline-block">หน้าหลัก</Link>
            </li>
            <li>
              <Link to="/plan" className="hover:text-red-600 transition-colors inline-block">แผนการเดินทาง</Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-red-600 transition-colors inline-block">รายการโปรด</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-red-600 transition-colors inline-block">ติดต่อเรา</Link>
            </li>
          </ul>
        </div>

        {/* คอลัมน์ที่ 3: บริการ */}
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-gray-400">บริการ</h4>
          <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
            <li>
              <Link to="/search?category=restaurants" className="hover:text-red-600 transition-colors inline-block">ร้านอาหาร</Link>
            </li>
            <li>
              <Link to="/search?category=accommodations" className="hover:text-red-600 transition-colors inline-block">ที่พัก</Link>
            </li>
            <li>
              <Link to="/search?category=attractions" className="hover:text-red-600 transition-colors inline-block">สถานที่ท่องเที่ยว</Link>
            </li>
          </ul>
        </div>

        {/* คอลัมน์ที่ 4: ช่องทางติดต่อ */}
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-gray-400">ติดต่อเรา</h4>
          <div className="space-y-2.5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400 shrink-0" />
              <a href="mailto:tankemmexr@gmail.com" className="hover:text-red-600 transition-colors">
                Email: tankemmexr@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400 shrink-0" />
              <a href="tel:0630265402" className="hover:text-red-600 transition-colors">
                Tel: 063-026-5402
              </a>
            </div>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
              >
                <span>ดูข้อมูลติดต่อฉบับเต็ม</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
