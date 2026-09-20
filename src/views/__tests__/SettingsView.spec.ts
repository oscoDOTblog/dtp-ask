import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SettingsView from '@/views/SettingsView.vue'

describe('beats export', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens the beats list and copies its grouped outline', async () => {
    const showModal = vi.fn()
    vi.stubGlobal('HTMLDialogElement', HTMLDialogElement)
    HTMLDialogElement.prototype.showModal = showModal
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

    const wrapper = mount(SettingsView, { global: { stubs: { RouterLink: true } } })
    const exportButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Export beats'))!
    await exportButton.trigger('click')
    expect(showModal).toHaveBeenCalledOnce()
    expect(wrapper.find('.beats-dialog').text()).toContain('Tell me about yourself.')

    await wrapper.find('.beats-dialog-footer button').trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledOnce()
    expect(writeText.mock.calls[0]?.[0]).toContain(
      'Personal narrative & motivation\nTell me about yourself.\n• Six years of growth at Capital One',
    )
    expect(wrapper.find('.beats-dialog-footer [role="status"]').text()).toContain(
      'Copied all beats',
    )
    wrapper.unmount()
  })
})

describe('appearance preference', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dataset.theme = 'light'
  })

  it('applies dark mode and saves it for later visits', async () => {
    const wrapper = mount(SettingsView, { global: { stubs: { RouterLink: true } } })
    const toggle = wrapper.findAll('input[role="switch"]')[2]!

    await toggle.setValue(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(
      JSON.parse(localStorage.getItem('interview-room.practice.v1')!).preferences.darkMode,
    ).toBe(true)

    wrapper.unmount()
    const remounted = mount(SettingsView, { global: { stubs: { RouterLink: true } } })
    expect(remounted.findAll('input[role="switch"]')[2]!.element).toHaveProperty('checked', true)
    remounted.unmount()
  })
})
