Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class Clicker {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int X, int Y);

    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);
}
"@

$pos = [System.Windows.Forms.Cursor]::Position
[Clicker]::SetCursorPos($pos.X, $pos.Y)

[Clicker]::mouse_event(0x02, 0, 0, 0, 0)
[Clicker]::mouse_event(0x04, 0, 0, 0, 0)
