param(
  [string]$DataFile,
  [string]$DeviceMatch = "VID_0483&PID_5743",
  [switch]$ListOnly
)

$ErrorActionPreference = "Stop"

Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

public static class UsbPrinterDevice {
    private const uint PresentOnly = 0;
    private const uint GenericWrite = 0x40000000;
    private const uint ShareRead = 0x00000001;
    private const uint ShareWrite = 0x00000002;
    private const uint OpenExisting = 3;

    [DllImport("cfgmgr32.dll", CharSet = CharSet.Unicode)]
    private static extern int CM_Get_Device_Interface_List_Size(
        out uint length,
        ref Guid interfaceClassGuid,
        string deviceId,
        uint flags);

    [DllImport("cfgmgr32.dll", CharSet = CharSet.Unicode)]
    private static extern int CM_Get_Device_Interface_List(
        ref Guid interfaceClassGuid,
        string deviceId,
        [Out] char[] buffer,
        uint bufferLength,
        uint flags);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateFile(
        string fileName,
        uint desiredAccess,
        uint shareMode,
        IntPtr securityAttributes,
        uint creationDisposition,
        uint flagsAndAttributes,
        IntPtr templateFile);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool WriteFile(
        IntPtr file,
        byte[] buffer,
        uint bytesToWrite,
        out uint bytesWritten,
        IntPtr overlapped);

    [DllImport("kernel32.dll")]
    private static extern bool CloseHandle(IntPtr handle);

    public static string[] List() {
        var printerInterface = new Guid("28D78FAD-5A12-11D1-AE5B-0000F803A8C2");
        uint length;
        var result = CM_Get_Device_Interface_List_Size(out length, ref printerInterface, null, PresentOnly);
        if (result != 0 || length <= 1) return Array.Empty<string>();

        var buffer = new char[length];
        result = CM_Get_Device_Interface_List(ref printerInterface, null, buffer, length, PresentOnly);
        if (result != 0) throw new Win32Exception(result, "Unable to enumerate USB printer interfaces.");

        var paths = new List<string>();
        var start = 0;
        for (var index = 0; index < buffer.Length; index++) {
            if (buffer[index] != '\0') continue;
            if (index == start) break;
            paths.Add(new string(buffer, start, index - start));
            start = index + 1;
        }
        return paths.ToArray();
    }

    public static int Write(string devicePath, byte[] data) {
        var handle = CreateFile(devicePath, GenericWrite, ShareRead | ShareWrite, IntPtr.Zero, OpenExisting, 0, IntPtr.Zero);
        if (handle == new IntPtr(-1)) throw new Win32Exception(Marshal.GetLastWin32Error(), "Unable to open USB printer.");
        try {
            uint written;
            if (!WriteFile(handle, data, (uint)data.Length, out written, IntPtr.Zero)) {
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Unable to write to USB printer.");
            }
            if (written != data.Length) throw new InvalidOperationException(string.Format("Only {0} of {1} bytes reached the printer.", written, data.Length));
            return (int)written;
        } finally {
            CloseHandle(handle);
        }
    }
}
'@

$interfaces = [UsbPrinterDevice]::List()
if ($ListOnly) {
  $interfaces | ForEach-Object { Write-Output $_ }
  exit 0
}

if (-not $DataFile -or -not (Test-Path -LiteralPath $DataFile)) {
  throw "A valid -DataFile is required."
}

$device = $interfaces | Where-Object { $_ -match [regex]::Escape($DeviceMatch) } | Select-Object -First 1
if (-not $device) {
  throw "No connected USB thermal printer matched $DeviceMatch."
}

$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $DataFile))
$written = [UsbPrinterDevice]::Write($device, $bytes)
Write-Output "PRINTED:${written}:$device"
