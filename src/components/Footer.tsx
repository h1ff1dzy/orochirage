import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDiscord, faTelegram, faVk} from "@fortawesome/free-brands-svg-icons";
import {Link} from "react-router-dom";

export function Footer() {
    return (
        <div className="footer bg-[#1E1E1E] w-full h-auto sticky top-[100vh] font-inter">
            <div className="footer_container flex flex-col p-8">
                <div className="footer_information flex flex-col justify-start content-start text-left">
                    <div className="footer_information__logo flex-1">
                        <img className="grayscale invert" src="/static/img/logo.svg" height="54" width="100"/>
                    </div>
                    <div className="footer_information__about flex-1 mt-2">
                        <div className="footer_information__about_caption uppercase">orochi</div>
                        <div className="footer_information__about_description">От фаната - для фанатов.</div>
                    </div>
                </div>
                <div className="footer_links mt-4">
                    <div className="footer_links__block flex flex-col content-start text-left h-fit gap-1 pb-3 border-b-2 footer_seperator">
                        <Link to="/user/policy#user-agreement" className="hover:underline">Пользовательское соглашение</Link>
                        <Link to="/user/policy#private-policy" className="hover:underline">Политика конфендинциальности</Link>
                    </div>
                    <div className="footer_links__social flex flex-col justify-between content-start h-28 pb-8 text-left mt-2 border-b-2 footer_seperator">
                        <a href="https://discord.com/invite/32xTp9qBCE" className="inline-flex items-center mb-2"><FontAwesomeIcon className="w-7 h-7 mr-2" icon={faDiscord}/> Discord</a>
                        <a href="https://t.me/orochisss" className="inline-flex items-center mb-2"><FontAwesomeIcon className="w-7 h-7 mr-2" icon={faTelegram}/> Telegram</a>
                        <a href="https://vk.com/orochirage" className="inline-flex items-center mb-2"><FontAwesomeIcon className="w-7 h-7 mr-2" icon={faVk}/> VK</a>
                    </div>
                </div>
                <div className="footer_copyright flex flex-col justify-start content-start text-left font-inter mt-2">
                    <div className="footer_copyright__block muted text-opacity-25">ОГРНИП 32443 00000 08455</div>
                    <div className="footer_copyright__block muted text-opacity-25">ИП Наумов Павел Андреевич</div>
                    <div className="footer_copyright__block font-bold text-opacity-35">© Orochi</div>
                </div>
            </div>
        </div>
    );
}