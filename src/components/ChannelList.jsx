import { channels } from '../config/site.js'
import { channelIcon } from './Icons.jsx'

export default function ChannelList({ only }) {
  const list = channels.filter((c) => c.url && (!only || only.includes(c.id)))
  return (
    <ul className="channel-list">
      {list.map((c) => {
        const Icon = channelIcon[c.id]
        const external = c.url.startsWith('http')
        return (
          <li key={c.id}>
            <a href={c.url} className={c.primary ? 'primary' : ''} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <span className="ic">{Icon && <Icon />}</span>
              <span><b>{c.label}</b><span>{c.desc}</span></span>
              <span className="go">열기</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
